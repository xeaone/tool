
/*
    license: MIT
    version: 3.4.0
    author: Alexander Elias
    repository: https://github.com/xeaone/tool
*/


// http-fetch:https://deno.land/std@0.180.0/encoding/base64.ts
var base64abc = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "+",
  "/"
];
function encode(data) {
  const uint8 = typeof data === "string" ? new TextEncoder().encode(data) : data instanceof Uint8Array ? data : new Uint8Array(data);
  let result = "", i;
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
    result += "==";
  }
  if (i === l) {
    result += base64abc[uint8[i - 2] >> 2];
    result += base64abc[(uint8[i - 2] & 3) << 4 | uint8[i - 1] >> 4];
    result += base64abc[(uint8[i - 1] & 15) << 2];
    result += "=";
  }
  return result;
}
function decode(b64) {
  const binString = atob(b64);
  const size = binString.length;
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes;
}

// http-fetch:https://deno.land/std@0.180.0/encoding/base64url.ts
function convertBase64ToBase64url(b64) {
  return b64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function encode2(data) {
  return convertBase64ToBase64url(encode(data));
}

// jwt/mod.ts
var encoder = new TextEncoder();
async function mod_default(header, payload, secret) {
  const encodedHeader = encode2(JSON.stringify(header));
  const encodedPayload = encode2(JSON.stringify(payload));
  const data = encoder.encode(`${encodedHeader}.${encodedPayload}`);
  const cleanedKey = secret.replace(
    /^\n?-----BEGIN PRIVATE KEY-----\n?|\n?-----END PRIVATE KEY-----\n?$/g,
    ""
  );
  const decodedKey = decode(cleanedKey).buffer;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    decodedKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    true,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    { hash: { name: "SHA-256" }, name: "RSASSA-PKCS1-v1_5" },
    key,
    data
  );
  const encodedSignature = encode2(signature);
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}
export {
  mod_default as default
};
//# sourceMappingURL=mod.js.map
