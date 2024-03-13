/*
    license: MIT
    version: 3.6.9
    author: Alexander Elias
    repository: https://github.com/xeaone/tool
*/

// http-fetch:https://deno.land/std@0.219.1/fmt/colors.ts
var { Deno } = globalThis;
var noColor = typeof Deno?.noColor === 'boolean' ? Deno.noColor : false;
var ANSI_PATTERN = new RegExp(
    [
        '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
        '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TXZcf-nq-uy=><~]))',
    ].join('|'),
    'g',
);

// http-fetch:https://deno.land/std@0.219.1/encoding/_util.ts
var encoder = new TextEncoder();
function getTypeName(value) {
    const type = typeof value;
    if (type !== 'object') {
        return type;
    } else if (value === null) {
        return 'null';
    } else {
        return value?.constructor?.name ?? 'object';
    }
}
function validateBinaryLike(source) {
    if (typeof source === 'string') {
        return encoder.encode(source);
    } else if (source instanceof Uint8Array) {
        return source;
    } else if (source instanceof ArrayBuffer) {
        return new Uint8Array(source);
    }
    throw new TypeError(
        `The input must be a Uint8Array, a string, or an ArrayBuffer. Received a value of the type ${getTypeName(source)}.`,
    );
}

// http-fetch:https://deno.land/std@0.219.1/encoding/base64.ts
var base64abc = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '+',
    '/',
];
function encodeBase64(data) {
    const uint8 = validateBinaryLike(data);
    let result = '', i;
    const l = uint8.length;
    for (i = 2; i < l; i += 3) {
        result += base64abc[uint8[i - 2] >> 2];
        result += base64abc[(uint8[i - 2] & 3) << 4 | uint8[i - 1] >> 4];
        result += base64abc[(uint8[i - 1] & 15) << 2 | uint8[i] >> 6];
        result += base64abc[uint8[i] & 63];
    }
    if (i === l + 1) {
        result += base64abc[uint8[i - 2] >> 2];
        result += base64abc[(uint8[i - 2] & 3) << 4];
        result += '==';
    }
    if (i === l) {
        result += base64abc[uint8[i - 2] >> 2];
        result += base64abc[(uint8[i - 2] & 3) << 4 | uint8[i - 1] >> 4];
        result += base64abc[(uint8[i - 1] & 15) << 2];
        result += '=';
    }
    return result;
}
function decodeBase64(b64) {
    const binString = atob(b64);
    const size = binString.length;
    const bytes = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
        bytes[i] = binString.charCodeAt(i);
    }
    return bytes;
}

// http-fetch:https://deno.land/std@0.219.1/encoding/base64url.ts
function convertBase64ToBase64url(b64) {
    return b64.endsWith('=') ? b64.endsWith('==') ? b64.replace(/\+/g, '-').replace(/\//g, '_').slice(0, -2) : b64.replace(/\+/g, '-').replace(/\//g, '_').slice(0, -1) : b64.replace(/\+/g, '-').replace(/\//g, '_');
}
function encodeBase64Url(data) {
    return convertBase64ToBase64url(encodeBase64(data));
}

// jwt/mod.ts
var encoder2 = new TextEncoder();
async function jwt(header, payload, secret) {
    const encodedHeader = encodeBase64Url(JSON.stringify(header));
    const encodedPayload = encodeBase64Url(JSON.stringify(payload));
    const data = encoder2.encode(`${encodedHeader}.${encodedPayload}`);
    const cleanedKey = secret.replace(
        /^\n?-----BEGIN PRIVATE KEY-----\n?|\n?-----END PRIVATE KEY-----\n?$/g,
        '',
    );
    const decodedKey = decodeBase64(cleanedKey).buffer;
    const key = await crypto.subtle.importKey(
        'pkcs8',
        decodedKey,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        true,
        ['sign'],
    );
    const signature = await crypto.subtle.sign(
        { hash: { name: 'SHA-256' }, name: 'RSASSA-PKCS1-v1_5' },
        key,
        data,
    );
    const encodedSignature = encodeBase64Url(signature);
    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}
export { jwt as default };
//# sourceMappingURL=mod.js.map
