export default (size) => Array.from(crypto.getRandomValues(new Uint8Array(size || 64)), x => x.toString(16).padStart(2, '0').slice(-2)).join('');
