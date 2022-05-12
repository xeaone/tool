
type BeforePost = (data: any, url: URL) => void;
type AfterPost = (data: any, url: URL, code: number) => void;

type PostOptions = {
    beforePost?: BeforePost;
    afterPost?: AfterPost;
};

export default class Post {

    beforePost?: BeforePost;
    afterPost?: AfterPost;

    constructor (options: PostOptions) {
        this.beforePost = options?.beforePost;
        this.afterPost = options?.afterPost;
    }

    async method (path: string, data: any): Promise<string | Record<any, any>> {
        const url = new URL(path, globalThis.location.origin);

        await this.beforePost?.(data, url);

        try { data = JSON.stringify(data); } catch { /**/ }

        const response = await globalThis.fetch(url.href, { method: 'POST', body: data });

        data = await response.text();

        try { data = JSON.parse(data); } catch { /**/ }

        await this.afterPost?.(data, new URL(response.url), response.status);

        return data;
    }

}
