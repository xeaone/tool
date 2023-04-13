import jwt from '../jwt/mod.js';
export class Google {
    key;
    project;
    #token;
    #expires;
    constructor(options) {
        this.key = this.key ?? options?.key;
        this.project = this.project ?? options?.project;
    }
    async #auth() {
        if (this.#expires && this.#expires >= Date.now())
            return;
        let response;
        if (this.key) {
            const iss = this.key.client_email;
            const iat = Math.round(Date.now() / 1000);
            const exp = iat + (30 * 60);
            const aud = 'https://oauth2.googleapis.com/token';
            const scope = 'https://www.googleapis.com/auth/cloud-platform';
            const assertion = await jwt({ typ: 'JWT', alg: 'RS256', }, { exp, iat, iss, aud, scope }, this.key.private_key);
            response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                body: [
                    `assertion=${encodeURIComponent(assertion)}`,
                    `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}`
                ].join('&'),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
        }
        else {
            response = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token', {
                method: 'GET',
                headers: { 'Metadata-Flavor': 'Google' }
            });
        }
        const result = await response.json();
        if (result.error) {
            throw new Error(JSON.stringify(result.error, null, '\t'));
        }
        this.#token = result.access_token;
        this.#expires = Date.now() + (result.expires_in * 1000);
    }
    async fetch(method, url, body) {
        if (!this.project) {
            const projectResponse = await fetch('http://metadata.google.internal/computeMetadata/v1/project/project-id', {
                method: 'GET',
                headers: { 'Metadata-Flavor': 'Google' }
            });
            this.project = await projectResponse.text();
        }
        if (!this.project)
            throw new Error('project required');
        await this.#auth();
        const headers = new Headers();
        if (this.#token)
            headers.set('Authorization', `Bearer ${this.#token}`);
        headers.set('Accept', 'application/json');
        headers.set('Content-Type', 'application/json');
        const request = { method, headers };
        let params = '';
        if (method === 'GET') {
            params = `?${new URLSearchParams(body).toString()}`;
        }
        else {
            request.body = body ? JSON.stringify(body) : undefined;
        }
        const response = await fetch(`${url}${params}`, request);
        return response;
    }
}