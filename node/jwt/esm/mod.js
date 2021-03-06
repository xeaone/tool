import * as base64url from './deps/deno.land/std@0.144.0/encoding/base64url.js';
import * as base64 from './deps/deno.land/std@0.144.0/encoding/base64.js';
const encoder = new TextEncoder();
export async function JwtCreate(header, payload, key) {
    const encodedHeader = base64url.encode(JSON.stringify(header));
    const encodedPayload = base64url.encode(JSON.stringify(payload));
    const data = encoder.encode(`${encodedHeader}.${encodedPayload}`);
    const cleanedKey = key.replace(/^\n?-----BEGIN PRIVATE KEY-----\n?|\n?-----END PRIVATE KEY-----\n?$/g, '');
    const decodedKey = base64.decode(cleanedKey).buffer;
    const rsaKey = await crypto.subtle.importKey('pkcs8', decodedKey, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, true, ['sign']);
    const signature = await crypto.subtle.sign({ hash: { name: 'SHA-256' }, name: 'RSASSA-PKCS1-v1_5' }, rsaKey, data);
    const encodedSignature = base64url.encode(signature);
    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}
export default { create: JwtCreate };
