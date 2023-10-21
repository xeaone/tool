
/*
    license: MIT
    version: 3.5.3
    author: Alexander Elias
    repository: https://github.com/xeaone/tool
*/


// decrypt/mod.ts
var hexToBuffer = function(data) {
  return Uint8Array.from(data.match(/.{2}/g) || [], (x) => parseInt(x, 16)).buffer;
};
var bufferToString = function(data) {
  return new TextDecoder().decode(data);
};
var stringToBuffer = function(data) {
  return new TextEncoder().encode(data);
};
async function decrypt(data, secret, options) {
  if (!data)
    throw new Error(" data required");
  if (!secret)
    throw new Error("secret required");
  const tag = options?.tag || 128;
  const length = options?.length || 256;
  const hash = options?.hash || "SHA-256";
  const seperator = options?.seperator || ".";
  const algorithm = options?.algorithm || "AES-GCM";
  const iterations = options?.iterations || 1e5;
  const parts = data.split(seperator);
  const body = hexToBuffer(parts[0]);
  const salt = hexToBuffer(parts[1]);
  const vector = hexToBuffer(parts[2]);
  const imported = await crypto.subtle.importKey(
    "raw",
    stringToBuffer(secret),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  const derived = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash },
    imported,
    { name: algorithm, length },
    true,
    ["decrypt"]
  );
  const decrypted = await crypto.subtle.decrypt(
    { iv: vector, name: algorithm, length, tagLength: tag },
    derived,
    body
  );
  return bufferToString(decrypted);
}
export {
  decrypt as default
};
//# sourceMappingURL=mod.js.map
