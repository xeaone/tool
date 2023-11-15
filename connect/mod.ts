import jwt from '../jwt/mod.ts';

// https://developers.google.com/identity/protocols/oauth2/service-account
type ServiceAccountCredentials = {
    type: 'service_account';
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri?: string;
    token_uri?: string;
    client_x509_cert_url?: string;
    auth_provider_x509_cert_url?: string;
};

// https://developers.google.com/identity/protocols/oauth2/web-server#offline
type ApplicationDefaultCredentials = {
    type: 'authorized_user';
    client_id: string;
    client_secret: string;
    grant_type: string;
    refresh_token: string;
};

type Credential =
    | 'meta'
    | 'application'
    | ApplicationDefaultCredentials
    | ServiceAccountCredentials;

type Options = {
    project?: string;
    timeout?: number;
    attempts?: number;
    // credential?: Credential;
    serviceAccountCredentials?: ServiceAccountCredentials;
    applicationDefaultCredentials?: ApplicationDefaultCredentials;
};

class Google {
    #token?: string;
    #expires?: number;
    #project?: string;
    #attempts = 5;
    #timeout = 1000;
    #serviceAccountCredentials?: ServiceAccountCredentials;
    #applicationDefaultCredentials?: ApplicationDefaultCredentials;

    constructor(options?: Options) {
        this.#project = options?.project;
        this.#timeout = options?.timeout ?? this.#timeout;
        this.#attempts = options?.attempts ?? this.#attempts;
        this.#serviceAccountCredentials = options?.serviceAccountCredentials;
        this.#applicationDefaultCredentials = options
            ?.applicationDefaultCredentials;
    }

    async #auth(attempts: number) {
        if (this.#expires && this.#expires >= Date.now()) return;

        let response;
        if (this.#applicationDefaultCredentials) {
            response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                signal: AbortSignal.timeout(this.#timeout * attempts),
                body: new URLSearchParams(this.#applicationDefaultCredentials),
            });
        } else if (this.#serviceAccountCredentials) {
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
                signal: AbortSignal.timeout(this.#timeout * attempts),
                body: new URLSearchParams({ assertion, grant_type }),
            });
        } else {
            try {
                response = await fetch(
                    'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
                    {
                        method: 'GET',
                        signal: AbortSignal.timeout(this.#timeout * attempts),
                        headers: { 'Metadata-Flavor': 'Google' },
                    },
                );
            } catch (error) {
                console.log('here');
                if (error?.name !== 'TimeoutError') {
                    throw new Error('credentials required');
                } else {
                    throw error;
                }
            }
        }

        if (response.status !== 200) {
            throw new Error(`${response.status} ${response.statusText} ${await response.text()}`);
        }

        const result = await response.json();

        this.#token = result.access_token;
        this.#expires = Date.now() + (result.expires_in * 1000);
    }

    applicationDefault(
        applicationDefaultCredentials: ApplicationDefaultCredentials,
    ) {
        this.#applicationDefaultCredentials = {
            ...applicationDefaultCredentials,
            grant_type: 'refresh_token',
        };
        return this;
    }

    serviceAccount(serviceAccountCredentials: ServiceAccountCredentials) {
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
    credential(credential: Credential) {
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
        } else if (credential === 'application') {
            let file;

            try {
                const prefix = Deno.build.os === 'windows' ? Deno.env.get('APPDATA') : `${Deno.env.get('HOME')}/.config`;
                file = Deno.readTextFileSync(
                    `${prefix}/gcloud/application_default_credentials.json`,
                );
            } catch {
                return;
            }

            const data = JSON.parse(file);
            this.#applicationDefaultCredentials = {
                ...data,
                grant_type: 'refresh_token',
            };
        } else if (credential.type === 'authorized_user') {
            this.applicationDefault(
                credential as ApplicationDefaultCredentials,
            );
        } else if (credential.type === 'service_account') {
            this.serviceAccount(credential as ServiceAccountCredentials);
        } else {
            throw new Error('credential option required');
        }
    }

    /**
     * @description
     * @param {String} data
     * @returns {Google}
     */
    project(data: string): this {
        this.#project = data;
        return this;
    }

    /**
     * @description Sets the max request time. Defaults to 1000ms.
     * @param {Number} timeout The milliseconds for request a timeout.
     * @return {Google}
     */
    timeout(timeout: number): this {
        this.#timeout = timeout;
        return this;
    }

    /**
     * @description Sets the max retry atttempts after request timeout. Defaults to 5.
     * @param {Number} attempts The amount of attempts for timeout retries.
     * @return {Google}
     */
    attempts(attempts: number): this {
        this.#attempts = attempts;
        return this;
    }

    async fetch(input: string | URL | Request, init?: RequestInit, attempts?: number): Promise<any> {
        attempts = attempts || 1;
        try {
            if (!this.project) {
                const projectResponse = await fetch(
                    'http://metadata.google.internal/computeMetadata/v1/project/project-id',
                    {
                        method: 'GET',
                        headers: { 'Metadata-Flavor': 'Google' },
                        signal: AbortSignal.timeout(this.#timeout * attempts),
                    },
                );

                this.#project = await projectResponse.text();
            }

            if (!this.#project) throw new Error('project required');

            await this.#auth(attempts);

            init = init ?? {};
            init.signal = AbortSignal.timeout(this.#timeout * attempts);

            const request = new Request(input, init);

            if (this.#token) request.headers.set('Authorization', `Bearer ${this.#token}`);

            const response = await fetch(request);

            // if (response.status !== 200) {
            //     throw new Error(`${response.status} ${response.statusText} \n${await response.text()}\n`);
            // }

            return response;
        } catch (error) {
            console.error(error);

            if (error?.name === 'TimeoutError' && attempts <= this.#attempts) {
                return this.fetch(input, init, attempts + 1);
            } else {
                throw error;
            }
        }
    }
}

export default {
    Google,
};
