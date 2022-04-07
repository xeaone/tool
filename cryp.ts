

// const ENCODING = 'hex';
const ITERATIONS = 999999;
// const KEY = 32;
const TAG = 16;
const SALT = 16;
const SIZE = 20;
const VECTOR = 12;
// const RANDOM= 20;
const HASH = 'SHA-512';
const ALGORITHM = 'aes-256-gcm';

interface KeyOptions {
    size?: number;
    hash?: string;
    iterations?: number;
    salt?: string | number | ArrayBufferLike;
}

export const hash = async function (data: string, type: string) {
    if (!data) throw new Error('data argument required');

    type = type || HASH;

    const buffer = await stringToBuffer(data);
    const bufferHash = await createHash(buffer, type);
    const hex = await bufferToHex(bufferHash);

    return hex;
};

export const compare = async function (password: string, data: string) {

    if (!data) throw new Error('data argument required');
    if (!password) throw new Error('password argument required');

    const salt = await hexToBuffer(data.split(':')[ 1 ]);
    const computed = await key(password, { salt });

    return data === computed;
};

export const key = async function (data: string, options?: KeyOptions) {
    if (!data) throw new Error('data argument required');

    const size = options?.size ?? SIZE;
    const hash = options?.hash ?? HASH;
    const salt = options?.salt ?? SALT;
    const iterations = options?.iterations ?? ITERATIONS;

    const bData =
        typeof data === 'string' ?
            stringToBuffer(data) : data;

    const bSalt =
        typeof salt === 'string' ?
            stringToBuffer(salt) :
            typeof salt === 'number' ?
                randomBytes(salt) : salt;

    const bKey = await pbkdf2(bData, bSalt, iterations, size, hash);

    const hKey = bufferToHex(bKey);
    const hSalt = bufferToHex(bSalt);

    return `${hKey}:${hSalt}`;
};

export const encrypt = async function (data: string, key: string, algorithm: string, vector: string | number) {

    if (!key) throw new Error('key argument required');
    if (!data) throw new Error(' data argument required');

    const [ sKey ] = key.split(':');
    vector = vector || VECTOR;
    algorithm = algorithm || ALGORITHM;

    const bKey = hexToBuffer(sKey);
    const bVector = typeof data === 'string' ? stringToBuffer(data) : data;
    const bData = typeof vector === 'string' ? stringToBuffer(vector) : randomBytes(vector);

    const bEncrypted = await cipher(algorithm, bKey, bVector, bData);

    const hEncrypted = bufferToHex(bEncrypted);
    const hVector = bufferToHex(bVector);

    return `${hEncrypted}:${hVector}`;
};

export const decrypt = async function (data: string, key: string, algorithm: string) {

    if (!key) throw new Error('key argument required');
    if (!data) throw new Error('data argument required');

    algorithm = algorithm || ALGORITHM;

    const [ sKey ] = key.split(':');
    const [ sData, sVector ] = data.split(':');

    const bKey = hexToBuffer(sKey);
    const bData = hexToBuffer(sData);
    const bVector = hexToBuffer(sVector);

    const bDecrypted = await decipher(algorithm, bKey, bVector, bData);
    const sDecrypted = await bufferToString(bDecrypted);

    return sDecrypted;
};

export const hexToBuffer = function (hex: string) {
    if (typeof hex !== 'string') throw new TypeError('expected input to be a string');
    if ((hex.length % 2) !== 0) throw new RangeError('expected string to be an even number of characters');

    const bytes = new Uint8Array(hex.length / 2);

    for (let i = 0, l = hex.length; i < l; i += 2) {
        bytes[ i / 2 ] = parseInt(hex.substring(i, i + 2), 16);
    }

    return bytes.buffer;
};

export const bufferToHex = function (buffer: ArrayBufferLike) {
    const bytes = new Uint8Array(buffer);
    const hex = new Array(bytes.length);

    for (let i = 0, l = bytes.length; i < l; i++) {
        hex[ i ] = bytes[ i ].toString(16).padStart(2, '0').slice(-2);
    }

    return hex.join('');
};

export const stringToBuffer = function (string: string) {
    const bytes = new Uint8Array(string.length);

    for (let i = 0, l = string.length; i < l; i++) {
        bytes[ i ] = string.charCodeAt(i);
    }

    return bytes.buffer;
};

export const bufferToString = function (buffer: ArrayBufferLike) {
    const bytes = new Uint8Array(buffer);
    const string = new Array(bytes.length);

    for (let i = 0, l = bytes.length; i < l; i++) {
        string[ i ] = String.fromCharCode(bytes[ i ]);
    }

    return string.join('');
};

export const createHash = function (data: ArrayBufferLike, type: string) {
    return window.crypto.subtle.digest(type, data);
};

export const randomBytes = function (size: number) {
    return window.crypto.getRandomValues(new Uint8Array(size)).buffer;
};

export const pbkdf2 = async function (password: ArrayBufferLike, salt: ArrayBufferLike, iterations: number, size: number, hash: string) {
    const key = await window.crypto.subtle.importKey('raw', password, { name: 'PBKDF2' }, false, [ 'deriveBits' ]);

    const bits = await window.crypto.subtle.deriveBits({
        salt,
        iterations,
        name: 'PBKDF2',
        hash: { name: hash }
    }, key, size << 3);

    return new Uint8Array(bits);
};

export const cipher = async function (algorithm: string, key: ArrayBufferLike, vector: ArrayBufferLike, data: ArrayBufferLike) {

    const oKey = await window.crypto.subtle.importKey('raw', key, {
        name: algorithm
    }, false, [ 'encrypt' ]);

    const encrypted = await window.crypto.subtle.encrypt({
        iv: vector,
        name: algorithm,
        tagLength: TAG * 8
    }, oKey, data);

    return encrypted;
};

export const decipher = async function (algorithm: string, key: ArrayBufferLike, vector: ArrayBufferLike, data: ArrayBufferLike) {

    const oKey = await window.crypto.subtle.importKey('raw', key, {
        name: algorithm
    }, false, [ 'decrypt' ]);

    const decrypted = await window.crypto.subtle.decrypt({
        iv: vector,
        name: algorithm,
        tagLength: TAG * 8
    }, oKey, data);

    return decrypted;
};
