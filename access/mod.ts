
// type Action = 'view' | 'search' | 'create' | 'update' | 'remove';

type Permission = {
    // view: boolean;
    // search: boolean;
    // create: boolean;
    // update: boolean;
    // remove: boolean;
    resource: string;
    [ key: string ]: string | boolean;
};

type Options = {
    actions: Array<string>;
    resources: Array<string>;
};

export default class Access {

    #actions: Array<string> = [];
    #resources: Array<string> = [];

    constructor (options?: Options) {
        this.#actions = options?.actions ?? this.#actions;
        this.#resources = options?.resources ?? this.#resources;
    }

    actions (actions: Array<string>) {
        this.#actions = actions;
        return this;
    }

    resources (resources: Array<string>) {
        this.#resources = resources;
        return this;
    }

    // checks if access is allowed
    allowed<P extends Permission> (permissions: Array<P>, resource: string, action: string): boolean {

        if (!this.#actions.includes(action)) return false;
        if (!this.#resources.includes(resource)) return false;
        if (permissions instanceof Array === false) return false;

        for (const permission of permissions) {
            if (permission.resource === resource && permission[ action ] === true) {
                return true;
            }
        }

        return false;
    }

    // checks permission format
    formated<P extends Permission> (permissions: Array<P>): boolean {

        if (permissions instanceof Array === false) return false;

        for (const permission of permissions) {

            if (this.#resources.includes(permission.resource) === false) return false;
            if (this.#actions.length !== Object.keys(permission).length) return false;

            for (const action of this.#actions) {
                if (action in permission === false || typeof permission[ action ] !== 'boolean') {
                    return false;
                }
            }

        }

        return true;
    }

    // checks a permission against another permission
    compare<P extends Permission> (credentialPermissions: Array<P>, payloadPermissions: Array<P>) {

        if (payloadPermissions instanceof Array === false) {
            return false;
        }

        if (credentialPermissions instanceof Array === false) {
            return false;
        }

        for (const payloadPermission of payloadPermissions) {
            for (const credentialPermission of credentialPermissions) {
                if (credentialPermission.resource === payloadPermission.resource) {
                    for (const action of this.#actions) {
                        if (credentialPermission[ action ] === false && payloadPermission[ action ] === true) {
                            return false;
                        }
                    }
                }
            }
        }

        return true;
    }

}