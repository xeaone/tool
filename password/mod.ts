
const SALT = 16;
const SIZE = 20;
const HASH = 'SHA-512';
const ITERATIONS = 999999;

type Options = {
    size?: number;
    hash?: string;
    iterations?: number;
    salt?: string | number | ArrayBuffer;
};

const randomBytes = function (size: number) {
    return crypto.getRandomValues(new Uint8Array(size)).buffer;
};

const bufferToHex = function (buffer: ArrayBuffer) {
    const bytes = new Uint8Array(buffer);
    const hex = new Array(bytes.length);

    for (let i = 0, l = bytes.length; i < l; i++) {
        hex[ i ] = bytes[ i ].toString(16).padStart(2, '0').slice(-2);
    }

    return hex.join('');
};

const stringToBuffer = function (string: string) {
    const bytes = new Uint8Array(string.length);
    for (let i = 0, l = string.length; i < l; i++) {
        bytes[ i ] = string.charCodeAt(i);
    }

    return bytes.buffer;
};

const hexToBuffer = function (hex: string) {
    if (typeof hex !== 'string') throw new TypeError('expected input to be a string');
    if ((hex.length % 2) !== 0) throw new RangeError('expected string to be an even number of characters');

    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0, l = hex.length; i < l; i += 2) {
        bytes[ i / 2 ] = parseInt(hex.substring(i, i + 2), 16);
    }

    return bytes.buffer;
};

const pbkdf2 = async function (password: ArrayBuffer, salt: ArrayBuffer, iterations: number, size: number, hash: string) {
    const key = await window.crypto.subtle.importKey('raw', password, {
        name: 'PBKDF2'
    }, false, [ 'deriveBits' ]);

    const bits = await window.crypto.subtle.deriveBits({
        salt,
        iterations,
        name: 'PBKDF2',
        hash: { name: hash }
    }, key, size << 3);

    return new Uint8Array(bits);
};

export const PasswordCreate = async function (data: string, options?: Options) {
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

export const PasswordCompare = async function (password: string, data: string, options?: Options) {

    if (!data) throw new Error('data argument required');
    if (!password) throw new Error('password argument required');

    const salt = await hexToBuffer(data.split(':')[ 1 ]);
    const computed = await PasswordCreate(password, { salt, ...options });

    return data === computed;
};

export default { create: PasswordCreate, compare: PasswordCompare } as const;
