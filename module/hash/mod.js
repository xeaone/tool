
/*
    license: MIT
    version: 2.0.0
    author: Alexander Elias
    repository: https://github.com/xeaone/tool
*/


// hash/mod.ts
async function hash(data) {
  const encoded = new TextEncoder().encode(data);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buffer)).map((x) => x.toString(16).padStart(2, "0")).join("");
}
export {
  hash as default
};
//# sourceMappingURL=mod.js.map
