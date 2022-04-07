
const encoder = new TextEncoder();

const stringToHash = function (text: string) {
    return crypto.subtle.digest('SHA-256', encoder.encode(text));
};

const bufferToString = function (buffer: ArrayBuffer) {
    return Array.from(new Uint8Array(buffer)).map(x => x.toString(16).padStart(2, '0')).join('');
};

export async function UsernameCreate (text: string) {
    return bufferToString(await stringToHash(text));
}

export async function UsernameCompare (text: string, hash: string) {
    return bufferToString(await stringToHash(text)) === hash;
}

export default { create: UsernameCreate, compare: UsernameCompare } as const;
