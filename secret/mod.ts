
export default (size: number) =>
    Array.from(
        crypto.getRandomValues(new Uint8Array(size || 64))
    ).map(
        x => x.toString(16).padStart(2, '0').slice(-2)
    ).join('');
