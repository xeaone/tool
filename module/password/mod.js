/*
    license: MIT
    version: 3.6.10
    author: Alexander Elias
    repository: https://github.com/xeaone/tool
*/

// password/mod.ts
var randomBytes = function (size) {
    return crypto.getRandomValues(new Uint8Array(size)).buffer;
};
var bufferToHex = function (data) {
    return Array.from(
        new Uint8Array(data),
        (x) => x.toString(16).padStart(2, '0'),
    ).join('');
};
var stringToBuffer = function (data) {
    return Uint8Array.from(data, (x) => x.charCodeAt(0)).buffer;
};
var hexToBuffer = function (data) {
    return Uint8Array.from(data.match(/.{2}/g) || [], (x) => parseInt(x, 16)).buffer;
};
var PasswordCreate = async function (secret, options) {
    if (!secret) {
        throw new Error('secret required');
    }
    const length = options?.length || 256;
    const hash = options?.hash || 'SHA-256';
    const seperator = options?.seperator || '.';
    const iterations = options?.iterations || 1e5;
    const salt = typeof options?.salt === 'string' ? stringToBuffer(options.salt) : typeof options?.salt === 'number' ? randomBytes(options.salt) : options?.salt instanceof ArrayBuffer ? options.salt : randomBytes(32);
    const imported = await crypto.subtle.importKey(
        'raw',
        stringToBuffer(secret),
        { name: 'PBKDF2' },
        false,
        ['deriveBits'],
    );
    const derived = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', hash, salt, iterations },
        imported,
        length,
    );
    return [bufferToHex(derived), bufferToHex(salt)].join(seperator);
};
var PasswordCompare = async function (secret, data, options) {
    if (!data) {
        throw new Error('data argument required');
    }
    if (!secret) {
        throw new Error('password argument required');
    }
    const seperator = options?.seperator || '.';
    const salt = await hexToBuffer(data.split(seperator)[1]);
    const computed = await PasswordCreate(secret, { salt, ...options });
    return data === computed;
};
var mod_default = {
    create: PasswordCreate,
    compare: PasswordCompare,
};
export { mod_default as default, PasswordCompare, PasswordCreate };
//# sourceMappingURL=mod.js.map
