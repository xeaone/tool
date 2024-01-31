import { build, stop } from 'https://deno.land/x/esbuild@v0.20.0/mod.js';
import http from 'https://deno.land/x/esbuild_plugin_http_fetch@v1.0.3/index.js';

const pkg = JSON.parse(await Deno.readTextFile('./package.json'));

const { writeTextFile } = Deno;

const names = [
    'access',
    'connect',
    'decrypt',
    'encrypt',
    'hash',
    'identifier',
    'jwt',
    'password',
    'post',
    'random',
    'secret',
    'username',
];

const banner = `
/*
    license: ${pkg.license}
    version: ${pkg.version}
    author: ${pkg.author}
    repository: https://github.com/xeaone/tool
*/
`;

await writeTextFile(
    'index.ts',
    `${banner}
${names.map((name) => `export * from './${name}/mod.ts';`).join('\n')}
${names.map((name) => `import ${name} from './${name}/mod.ts';`).join('\n')}

export default {
    ${names.map((name) => `${name},`).join('\n\t')}
}
`,
);

await writeTextFile(
    'module/index.js',
    `${banner}
${names.map((name) => `export * from './${name}/mod.js';`).join('\n')}
${names.map((name) => `import ${name} from './${name}/mod.js';`).join('\n')}

export default {
    ${names.map((name) => `${name},`).join('\n\t')}
}
`,
);

await Promise.all(names.map((name) =>
    build({
        color: true,
        bundle: true,
        minify: false,
        sourcemap: true,
        treeShaking: true,
        banner: { js: banner },
        plugins: [http],
        format: 'esm',
        target: 'esnext',
        logLevel: 'verbose',
        // platform: 'browser',
        outdir: `module/${name}/`,
        entryPoints: [`${name}/mod.ts`],
    })
));

stop();
