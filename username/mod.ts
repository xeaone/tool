const stringToHash = function (data: string): Promise<ArrayBuffer> {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
};

const bufferToString = function (data: ArrayBuffer): string {
    return Array.from(
        new Uint8Array(data),
        (x) => x.toString(16).padStart(2, '0'),
    ).join('');
};

export async function UsernameCreate(text: string): Promise<string> {
    return bufferToString(await stringToHash(text));
}

export async function UsernameCompare(
    text: string,
    hash: string,
): Promise<boolean> {
    return bufferToString(await stringToHash(text)) === hash;
}

export default {
    create: UsernameCreate,
    compare: UsernameCompare,
} as const;
