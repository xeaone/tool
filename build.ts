import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

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

// import { transform as PackageShim } from 'https://deno.land/x/dnt/transform.ts';

// const output = await transform({
//     target: 'Latest',
//     entryPoints: [ './identifier/mod.ts' ],
//     shims: [
//         {} as PackageShim
//     ],
//     // testShims: [],
//     // mappings: {}, // optional specifier mappings
// });

// console.log(output.main.files[ 0 ].fileText);
