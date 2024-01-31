/*
    license: MIT
    version: 3.6.6
    author: Alexander Elias
    repository: https://github.com/xeaone/tool
*/

// access/mod.ts
var Access = class {
    #actions = [];
    #resources = [];
    constructor(options) {
        this.#actions = options?.actions ?? this.#actions;
        this.#resources = options?.resources ?? this.#resources;
    }
    actions(actions) {
        this.#actions = actions;
        return this;
    }
    resources(resources) {
        this.#resources = resources;
        return this;
    }
    // checks if access is allowed
    allowed(permissions, resource, action) {
        if (!this.#actions.includes(action)) {
            return false;
        }
        if (!this.#resources.includes(resource)) {
            return false;
        }
        if (permissions instanceof Array === false) {
            return false;
        }
        for (const permission of permissions) {
            if (permission.resource === resource && permission[action] === true) {
                return true;
            }
        }
        return false;
    }
    // checks permission format
    formated(permissions) {
        if (permissions instanceof Array === false) {
            return false;
        }
        for (const permission of permissions) {
            if (this.#resources.includes(permission.resource) === false) {
                return false;
            }
            if (this.#actions.length !== Object.keys(permission).length) {
                return false;
            }
            for (const action of this.#actions) {
                if (action in permission === false || typeof permission[action] !== 'boolean') {
                    return false;
                }
            }
        }
        return true;
    }
    // checks a permission against another permission
    compare(credentialPermissions, payloadPermissions) {
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
                        if (credentialPermission[action] === false && payloadPermission[action] === true) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }
};
var mod_default = Access;
export { mod_default as default };
//# sourceMappingURL=mod.js.map
