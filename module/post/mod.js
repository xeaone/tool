
/*
    license: MIT
    version: 3.6.5
    author: Alexander Elias
    repository: https://github.com/xeaone/tool
*/


// post/mod.ts
var Post = class {
  beforePost;
  duringPost;
  afterPost;
  constructor(options) {
    this.beforePost = options?.beforePost;
    this.duringPost = options?.duringPost;
    this.afterPost = options?.afterPost;
  }
  async method(path, data) {
    const url = new URL(path, globalThis.location.origin);
    await this.beforePost?.(data, url);
    try {
      data = JSON.stringify(data);
    } catch {
    }
    const response = await globalThis.fetch(url.href, {
      method: "POST",
      body: data
    });
    if (!response.body) {
      await this.afterPost?.(
        data,
        new URL(response.url),
        response.status
      );
      return {};
    }
    const decoder = new TextDecoder();
    const reader = response.body.getReader();
    let result = "";
    let stream = await reader.read();
    while (!stream.done) {
      result += decoder.decode(stream.value, { stream: true });
      await this.duringPost?.(
        data,
        new URL(response.url),
        response.status
      );
      stream = await reader.read();
    }
    try {
      result = JSON.parse(result);
    } catch {
    }
    await this.afterPost?.(result, new URL(response.url), response.status);
    return result;
  }
};
export {
  Post as default
};
//# sourceMappingURL=mod.js.map
