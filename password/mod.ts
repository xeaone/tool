/*
https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf
"5.1 The Salt (S)" At least 16 bytes
"5.2 The Iteration Count (C)" Minimum 1,000
*/

type Options = {
    length?: number;
    hash?: string;
    iterations?: number;
    salt?: string | number | ArrayBuffer;
    seperator?: string;
};

const randomBytes = function (size: number): ArrayBuffer {
    return crypto.getRandomValues(new Uint8Array(size)).buffer;
};

const bufferToHex = function (data: ArrayBuffer): string {
    return Array.from(
        new Uint8Array(data),
        (x) => x.toString(16).padStart(2, '0'),
    ).join('');
};

const stringToBuffer = function (data: string): ArrayBuffer {
    return Uint8Array.from(data, (x) => x.charCodeAt(0)).buffer;
};

const hexToBuffer = function (data: string): ArrayBuffer {
    return Uint8Array.from(data.match(/.{2}/g) || [], (x) => parseInt(x, 16))
        .buffer;
};

export const PasswordCreate = async function (
    secret: string,
    options?: Options,
): Promise<string> {
    if (!secret) throw new Error('secret required');

    const length = options?.length || 256;
    const hash = options?.hash || 'SHA-256';
    const seperator = options?.seperator || '.';
    const iterations = options?.iterations || 100_000;

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

export const PasswordCompare = async function (
    secret: string,
    data: string,
    options?: Options,
): Promise<boolean> {
    if (!data) throw new Error('data argument required');
    if (!secret) throw new Error('password argument required');

    const seperator = options?.seperator || '.';
    const salt = await hexToBuffer(data.split(seperator)[1]);
    const computed = await PasswordCreate(secret, { salt, ...options });

    return data === computed;
};

export default {
    create: PasswordCreate,
    compare: PasswordCompare,
} as const;
