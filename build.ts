import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir('./node');

await build({
    compilerOptions: { target: 'Latest' },
    entryPoints: [ './access/mod.ts' ],
    outDir: './node/access',
    shims: {},
    package: {
        version: '0.0.1',
        name: 'access'
    },
    test: false,
    typeCheck: false,
    declaration: false,
    scriptModule: false,
    skipSourceOutput: true,
});

await build({
    compilerOptions: { target: 'Latest' },
    entryPoints: [ './identifier/mod.ts' ],
    outDir: './node/identifier',
    shims: {
        // deno: true,
        crypto: true
    },
    package: {
        version: '0.0.1',
        name: 'identifier'
    },
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
