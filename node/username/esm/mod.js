import * as dntShim from "./_dnt.shims.js";
const encoder = new TextEncoder();
const stringToHash = function (text) {
    return dntShim.crypto.subtle.digest('SHA-256', encoder.encode(text));
};
const bufferToString = function (data) {
    return Array.from(new Uint8Array(data), x => x.toString(16).padStart(2, '0')).join('');
};
export async function UsernameCreate(text) {
    return bufferToString(await stringToHash(text));
}
export async function UsernameCompare(text, hash) {
    return bufferToString(await stringToHash(text)) === hash;
}
export default { create: UsernameCreate, compare: UsernameCompare };
