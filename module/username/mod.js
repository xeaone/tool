
/*
    license: MIT
    version: 3.5.4
    author: Alexander Elias
    repository: https://github.com/xeaone/tool
*/


// username/mod.ts
var stringToHash = function(data) {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
};
var bufferToString = function(data) {
  return Array.from(
    new Uint8Array(data),
    (x) => x.toString(16).padStart(2, "0")
  ).join("");
};
async function UsernameCreate(text) {
  return bufferToString(await stringToHash(text));
}
async function UsernameCompare(text, hash) {
  return bufferToString(await stringToHash(text)) === hash;
}
var mod_default = {
  create: UsernameCreate,
  compare: UsernameCompare
};
export {
  UsernameCompare,
  UsernameCreate,
  mod_default as default
};
//# sourceMappingURL=mod.js.map
