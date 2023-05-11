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
            const method = 'POST';
            const body = new URLSearchParams({
                'assertion': assertion,
                'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            });
            const headers = new Headers({
                'Content-Type': 'application/x-www-form-urlencoded',
            });
            response = await fetch('https://oauth2.googleapis.com/token', { method, body, headers });
        }
        else {
            const method = 'GET';
            const headers = new Headers({
                'Metadata-Flavor': 'Google'
            });
            response = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token', { method, headers });
        }
        const result = await response.json();
        if (result.error) {
            throw new Error(JSON.stringify(result.error, null, '\t'));
        }
        this.#token = result.access_token;
        this.#expires = Date.now() + (result.expires_in * 1000);
    }
    async fetch(input, init) {
        if (!this.project) {
            const method = 'GET';
            const headers = new Headers({
                'Metadata-Flavor': 'Google'
            });
            const projectResponse = await fetch('http://metadata.google.internal/computeMetadata/v1/project/project-id', { method, headers });
            this.project = await projectResponse.text();
        }
        if (!this.project)
            throw new Error('project required');
        await this.#auth();
        const request = new Request(input, init);
        if (this.#token)
            request.headers.set('Authorization', `Bearer ${this.#token}`);
        const response = await fetch(request);
        return response;
    }
}
