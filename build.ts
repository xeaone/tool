import { build, emptyDir } from 'https://deno.land/x/dnt@0.22.0/mod.ts';
import { ts } from 'https://deno.land/x/ts_morph@14.0.0/mod.ts';

import pkg from './package.json' assert { type: 'json' };

const header = `
/*
    license: ${pkg.license}
    version: ${pkg.version}
    author: ${pkg.author}
    repository: https://github.com/xeaone/tool
    jsdelivr: https://cdn.jsdelivr.net/gh/xeaone/tool@main/
*/
`;

await emptyDir('./node');

await Promise.all([
    'access',
    'connect',
    'decrypt',
    'encrypt',
    'hash',
    'identifier',
    'jwt',
    'password',
    // 'post',
    'username',
    'secret',
].map(name => {
    return build({
        package: { version: pkg.version, name: `${pkg.name}/${name}` },
        compilerOptions: { target: 'Latest' },
        entryPoints: [`./${name}/mod.ts`],
        outDir: `./node/${name}`,
        shims: {},
        test: false,
        typeCheck: false,
        declaration: false,
        scriptModule: false,
        skipSourceOutput: true,
    });
}));

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

Deno.writeTextFileSync('./post/mod.js',
    ts.transpile(
        header + Deno.readTextFileSync('./post/mod.ts'),
        { target: ts.ScriptTarget.Latest }
    )
);
