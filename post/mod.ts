type Key = string | number | symbol;
type Data = BodyInit | Array<unknown> | Record<Key, unknown>;
type Result = Promise<string | Record<Key, unknown>>;

type BeforePost = <T extends Data>(data: T, url: URL) => Promise<void> | void;
type DuringPost = <T extends Data>(data: T, url: URL, code: number) => Promise<void> | void;
type AfterPost = <T extends Data>(data: T, url: URL, code: number) => Promise<void> | void;

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

    async method(path: string, data: Data): Result {
        const url = new URL(path, globalThis.location.origin);

        await this.beforePost?.(data, url);

        try {
            data = JSON.stringify(data);
        } catch { /**/ }

        const response = await globalThis.fetch(url.href, {
            method: 'POST',
            body: data as BodyInit,
        });

        if (!response.body) {
            await this.afterPost?.(
                data,
                new URL(response.url),
                response.status,
            );
            return {};
        }

        const decoder = new TextDecoder();
        const reader = response.body.getReader();

        let result = '';
        let stream = await reader.read();

        while (!stream.done) {
            result += decoder.decode(stream.value, { stream: true });

            await this.duringPost?.(
                data,
                new URL(response.url),
                response.status,
            );

            stream = await reader.read();
        }

        try {
            result = JSON.parse(result);
        } catch { /**/ }

        await this.afterPost?.(result, new URL(response.url), response.status);

        return result;
    }
}
