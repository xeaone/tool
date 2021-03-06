/*
    license: MIT
    version: 0.0.3
    author: Alexander Elias
    repository: https://github.com/xeaone/tool
    jsdelivr: https://cdn.jsdelivr.net/gh/xeaone/tool@main/
*/
export default class Post {
    beforePost;
    afterPost;
    constructor(options) {
        this.beforePost = options?.beforePost;
        this.afterPost = options?.afterPost;
    }
    async method(path, data) {
        const url = new URL(path, globalThis.location.origin);
        await this.beforePost?.(data, url);
        try {
            data = JSON.stringify(data);
        }
        catch { /**/ }
        const response = await globalThis.fetch(url.href, { method: 'POST', body: data });
        data = await response.text();
        try {
            data = JSON.parse(data);
        }
        catch { /**/ }
        await this.afterPost?.(data, new URL(response.url), response.status);
        return data;
    }
}
