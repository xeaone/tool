/**
 * @description Hash a string and return hex encoded string.
 * @param {string} data
 * @returns {Promise<string>}
 */
export default async function hash(data: string): Promise<string> {
    const encoded = new TextEncoder().encode(data);
    const buffer = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(buffer)).map((x) => x.toString(16).padStart(2, '0')).join('');
}
