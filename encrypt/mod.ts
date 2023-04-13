
const randomBytes = function (size: number) {
    return crypto.getRandomValues(new Uint8Array(size)).buffer;
};

const bufferToHex = function (data: ArrayBufferLike) {
    return Array.from(new Uint8Array(data)).map(x => x.toString(16).padStart(2, '0')).join('');
};

const stringToBuffer = function (data: string) {
    return new TextEncoder().encode(data);
};

export default async function encrypt(
    data: string,
    secret: string,
    options?: {
        tag?: number,
        length?: number,
        iterations?: number,

        hash?: string,
        algorithm?: string,
        seperator?: string,

        salt?: number;
        vector?: number,
    }
): Promise<string> {

    if (!data) throw new Error(' data required');
    if (!secret) throw new Error('secret required');

    const tag = options?.tag || 128;
    const length = options?.length || 256;
    const hash = options?.hash || 'SHA-256';
    const seperator = options?.seperator || '.';
    const algorithm = options?.algorithm || 'AES-GCM';
    const iterations = options?.iterations || 100_000;

    const salt = typeof options?.salt === 'number' ? randomBytes(options.salt) : randomBytes(32);
    const vector = typeof options?.vector === 'number' ? randomBytes(options.vector) : randomBytes(16);
    const body = stringToBuffer(data);

    const imported = await crypto.subtle.importKey(
        'raw',
        stringToBuffer(secret),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    const derived = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations, hash },
        imported,
        { name: algorithm, length },
        true,
        ['encrypt']
    );

    const encrypted = await crypto.subtle.encrypt(
        { iv: vector, name: algorithm, length, tagLength: tag },
        derived,
        body
    );

    return [bufferToHex(encrypted), bufferToHex(salt), bufferToHex(vector)].join(seperator);
}
