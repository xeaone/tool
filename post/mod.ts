type BeforePost = (data: any, url: URL) => void;
type DuringPost = (data: any, url: URL, code: number) => void;
type AfterPost = (data: any, url: URL, code: number) => void;

type PostOptions = {
    beforePost?: BeforePost;
    duringPost?: DuringPost;
    afterPost?: AfterPost;
};

export default class Post {
    beforePost?: BeforePost;
    duringPost?: DuringPost;
    afterPost?: AfterPost;

    constructor(options: PostOptions) {
        this.beforePost = options?.beforePost;
        this.duringPost = options?.duringPost;
        this.afterPost = options?.afterPost;
    }

    async method(path: string, data: any): Promise<string | Record<any, any>> {
        const url = new URL(path, globalThis.location.origin);

        await this.beforePost?.(data, url);

        try {
            data = JSON.stringify(data);
        } catch { /**/ }

        const response = await globalThis.fetch(url.href, {
            method: 'POST',
            body: data,
        });

        if (!response.body) {
            await this.afterPost?.(
                data,
                new URL(response.url),
                response.status,
            );
            return {};
        }

        data = '';
        const decoder = new TextDecoder();
        const reader = response.body.getReader();

        let result = await reader.read();

        while (!result.done) {
            data += decoder.decode(result.value, { stream: true });
            await this.duringPost?.(
                data,
                new URL(response.url),
                response.status,
            );
            result = await reader.read();
        }

        try {
            data = JSON.parse(data);
        } catch { /**/ }

        await this.afterPost?.(data, new URL(response.url), response.status);

        return data;
    }
}
