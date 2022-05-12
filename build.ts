import { build, emptyDir } from 'https://deno.land/x/dnt/mod.ts';
import { ts } from 'https://deno.land/x/ts_morph@14.0.0/mod.ts';

await emptyDir('./node');

await build({
    package: { version: '0.0.1', name: 'access' },
    compilerOptions: { target: 'Latest' },
    entryPoints: [ './access/mod.ts' ],
    outDir: './node/access',
    shims: {},
    test: false,
    typeCheck: false,
    declaration: false,
    scriptModule: false,
    skipSourceOutput: true,
});

await build({
    package: { version: '0.0.1', name: 'identifier' },
    compilerOptions: { target: 'Latest' },
    entryPoints: [ './identifier/mod.ts' ],
    outDir: './node/identifier',
    shims: { crypto: true },
    test: false,
    typeCheck: false,
    declaration: false,
    scriptModule: false,
    skipSourceOutput: true,
});

await build({
    package: { version: '0.0.1', name: 'identifier' },
    compilerOptions: { target: 'Latest' },
    entryPoints: [ './password/mod.ts' ],
    outDir: './node/password',
    shims: { crypto: true },
    test: false,
    typeCheck: false,
    declaration: false,
    scriptModule: false,
    skipSourceOutput: true,
});

await build({
    package: { version: '0.0.1', name: 'username' },
    compilerOptions: { target: 'Latest' },
    entryPoints: [ './username/mod.ts' ],
    outDir: './node/username',
    shims: { crypto: true },
    test: false,
    typeCheck: false,
    declaration: false,
    scriptModule: false,
    skipSourceOutput: true,
});

// await build({
//     package: { version: '0.0.1', name: 'post' },
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
        Deno.readTextFileSync('./post/mod.ts'),
        { target: ts.ScriptTarget.Latest }
    )
);

