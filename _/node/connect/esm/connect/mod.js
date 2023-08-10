import jwt from '../jwt/mod.js';
export class Google {
    #token;
    #expires;
    #project;
    #serviceAccountCredentials;
    #applicationDefaultCredentials;
    constructor(options) {
        this.#project = options?.project;
        this.#serviceAccountCredentials = options?.serviceAccountCredentials;
        this.#applicationDefaultCredentials = options?.applicationDefaultCredentials;
    }
    async #auth() {
        if (this.#expires && this.#expires >= Date.now())
            return;
        let response;
        if (this.#applicationDefaultCredentials) {
            response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                body: new URLSearchParams(this.#applicationDefaultCredentials)
            });
        }
        else if (this.#serviceAccountCredentials) {
            const { client_email, private_key } = this.#serviceAccountCredentials;
            const iss = client_email;
            const iat = Math.round(Date.now() / 1000);
            const exp = iat + (30 * 60);
            const aud = 'https://oauth2.googleapis.com/token';
            const scope = 'https://www.googleapis.com/auth/datastore';
            const assertion = await jwt({ typ: 'JWT', alg: 'RS256' }, { exp, iat, iss, aud, scope }, private_key);
            const grant_type = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
            response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                body: new URLSearchParams({ assertion, grant_type }),
            });
        }
        else {
            try {
                response = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token', {
                    method: 'GET',
                    headers: { 'Metadata-Flavor': 'Google' },
                });
            }
            catch {
                throw new Error('credentials required');
            }
        }
        const result = await response.json();
        if (result.error) {
            throw new Error(JSON.stringify(result.error, null, '\t'));
        }
        this.#token = result.access_token;
        this.#expires = Date.now() + (result.expires_in * 1000);
    }
    applicationDefault(applicationDefaultCredentials) {
        this.#applicationDefaultCredentials = { ...applicationDefaultCredentials, grant_type: 'refresh_token' };
        return this;
    }
    serviceAccount(serviceAccountCredentials) {
        this.#serviceAccountCredentials = { ...serviceAccountCredentials };
        return this;
    }
    /**
     * @description
     *      Initialize application default credentials with `gcloud auth application-default login`.
     *      This file should be created and will be used as the application credential:
     *      - Windows: %APPDATA%\gcloud\application_default_credentials.json
     *      - Linux/Mac: $HOME/.config/gcloud/application_default_credentials.json
     * @param credential
     */
    credential(credential) {
        // const command = await new Deno.Command('gcloud', {
        //     args: ['auth', 'application-default', 'print-access-token'],
        //     stderr: 'inherit',
        // }).output();
        // result = {
        //     expires_in: 3599,
        //     access_token: new TextDecoder().decode(command.stdout),
        // };
        if (credential === 'meta') {
            return;
        }
        else if (credential === 'application') {
            let file;
            try {
                const prefix = Deno.build.os === 'windows' ? Deno.env.get('APPDATA') : `${Deno.env.get('HOME')}/.config`;
                file = Deno.readTextFileSync(`${prefix}/gcloud/application_default_credentials.json`);
            }
            catch {
                return;
            }
            const data = JSON.parse(file);
            this.#applicationDefaultCredentials = { ...data, grant_type: 'refresh_token' };
        }
        else if (credential.type === 'authorized_user') {
            this.applicationDefault(credential);
        }
        else if (credential.type === 'service_account') {
            this.serviceAccount(credential);
        }
        else {
            throw new Error('credential option required');
        }
    }
    project(data) {
        this.#project = data;
        return this;
    }
    async fetch(input, init) {
        if (!this.project) {
            const method = 'GET';
            const headers = new Headers({
                'Metadata-Flavor': 'Google'
            });
            const projectResponse = await fetch('http://metadata.google.internal/computeMetadata/v1/project/project-id', { method, headers });
            this.#project = await projectResponse.text();
        }
        if (!this.#project)
            throw new Error('project required');
        await this.#auth();
        const request = new Request(input, init);
        if (this.#token)
            request.headers.set('Authorization', `Bearer ${this.#token}`);
        const response = await fetch(request);
        return response;
    }
}
