// import { build, emptyDir } from 'https://deno.land/x/dnt@0.22.0/mod.ts';
// import { ts } from 'https://deno.land/x/ts_morph@14.0.0/mod.ts';

import { build, stop } from 'https://deno.land/x/esbuild@v0.19.0/mod.js';
import http from 'https://deno.land/x/esbuild_plugin_http_fetch@v1.0.2/index.js';

import pkg from './package.json' assert { type: 'json' };

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
    `${names.map((name) => `import ${name} from './${name}/mod.ts';`).join('\n')}

export default {
    ${names.map((name) => `${name},`).join('\n\t')}
}
`,
);

await writeTextFile(
    'module/index.js',
    `${names.map((name) => `import ${name} from './${name}/mod.js';`).join('\n')}

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

// await emptyDir('./node');

// await Promise.all([
//     'access',
//     'connect',
//     'decrypt',
//     'encrypt',
//     'hash',
//     'identifier',
//     'jwt',
//     'password',
//     // 'post',
//     'username',
//     'secret',
// ].map(name => {
//     return build({
//         package: { version: pkg.version, name: `${pkg.name}/${name}` },
//         compilerOptions: { target: 'Latest' },
//         entryPoints: [`./${name}/mod.ts`],
//         outDir: `./node/${name}`,
//         shims: {},
//         test: false,
//         typeCheck: false,
//         declaration: false,
//         scriptModule: false,
//         skipSourceOutput: true,
//     });
// }));

// await build({
//     package: { version, name: 'post' },
//     compilerOptions: { target: 'Latest' },
//     entryPoints: [ './post/mod.ts' ],
//     outDir: './temp/post',
//     shims: {},
//     test: false,
//     typeCheck: false,
//     declaration: false,
//     scriptModule: false,
//     skipSourceOutput: true,
// });

// Deno.copyFileSync('./temp/post/esm/mod.js', './post/mod.js');
// Deno.removeSync('./temp', { recursive: true });

// Deno.writeTextFileSync('./post/mod.js',
//     ts.transpile(
//         header + Deno.readTextFileSync('./post/mod.ts'),
//         { target: ts.ScriptTarget.Latest }
//     )
// );
