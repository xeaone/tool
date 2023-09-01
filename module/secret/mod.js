
/*
    license: MIT
    version: 3.2.4
    author: Alexander Elias
    repository: https://github.com/xeaone/tool
*/


// secret/mod.ts
var mod_default = (size) => Array.from(
  crypto.getRandomValues(new Uint8Array(size || 64)),
  (x) => x.toString(16).padStart(2, "0").slice(-2)
).join("");
export {
  mod_default as default
};
//# sourceMappingURL=mod.js.map
