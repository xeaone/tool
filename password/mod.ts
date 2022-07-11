
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

const randomBytes = function (size: number): ArrayBuffer {
    return crypto.getRandomValues(new Uint8Array(size)).buffer;
};

const bufferToHex = function (data: ArrayBuffer): string {
    return Array.from(new Uint8Array(data), x => x.toString(16).padStart(2, '0')).join('');
};

const stringToBuffer = function (data: string): ArrayBuffer {
    return Uint8Array.from(data, x => x.charCodeAt(0)).buffer;
};

// if (typeof hex !== 'string') throw new TypeError('expected input to be a string');
// if ((hex.length % 2) !== 0) throw new RangeError('expected string to be an even number of characters');
const hexToBuffer = function (data: string): ArrayBuffer {
    return Uint8Array.from((data.match(/.{2}/gi) || []).map(x => parseInt(x, 16))).buffer;
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
