#!/usr/bin/env -S deno run --allow-read --allow-write

import { parseArgs } from 'https://deno.land/std@0.219.1/cli/parse_args.ts';
import { resolve } from 'https://deno.land/std@0.219.1/path/resolve.ts';
import { blue, red } from 'https://deno.land/std@0.219.1/fmt/colors.ts';
// import * as semver from 'https://deno.land/std@0.219.1/semver/mod.ts';
import { parse } from 'https://deno.land/std@0.219.0/semver/parse.ts';
import versionImport from '../version.ts';

/**
 * Writes deno.json and package.json with VERSION and publishes to jsr, npm, git tag, and git commit.
 * @module
 */

// const versionPattern = /^(.*?['"])([0-9.]+)(['"].*)$/m;
// const releases = ['pre', 'major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease'];
const cmd = (cmd: string, args?: string[]) => new Deno.Command(cmd, { args }).spawn().output();

const helpText = `
    Version: ${versionImport}
    DESCRIPTION: Writes deno.json and package.json with VERSION and publishes to jsr, npm, git tag, and git commit.

    UNINSTALL: deno uninstall publish
    INSTALL: deno install --allow-read --allow-write --name publish https://deno.land/x/xtool/executable/publish.ts
    UPGRADE: deno install --allow-read --allow-write --name publish https://deno.land/x/xtool/executable/publish.ts -f

    USAGE:
        publish [VERSION] [OPTIONS]

    OPTIONS:
        --help          Prints help information
        --version       Prints version information

        --git           Creates git commit with version (default is true)
        --tag           Creates git tag with version (default is true)
        --npm           Publishes npm version  (default is true)
        --jsr           Publishes jsr version  (default is true)

`;

// METHODS:
//     pre
//     major
//     premajor
//     minor
//     preminor
//     patch
//     prepatch
//     prerelease

export const publish = async function () {
    const options = parseArgs(Deno.args, {
        boolean: [
            'git',
            'tag',
            'npm',
            'jsr',
            'help',
            'version',
        ],
        default: {
            git: true,
            tag: true,
            npm: true,
            jsr: true,
            help: false,
            version: false,
        },
    });

    const [version] = options._ as string[];

    if (!version) {
        console.log(helpText);
        Deno.exit();
    }

    if (options.version) {
        console.log(`Publish Version: ${versionImport}`);
        Deno.exit();
    }

    if (options.help) {
        console.log(helpText);
        Deno.exit();
    }

    // if (!releases.includes(release)) {
    //     console.error(red(`release required: ${releases.join(', ')}`));
    //     Deno.exit();
    // }

    // const versionPath = resolve('./version.ts');
    // const versionFile = await Deno.readTextFile(versionPath).catch(() => {
    //     console.error(red(`requires ./version.ts -> export default '3.0.1';`));
    //     Deno.exit();
    // });

    // const { major, minor, patch } = semver.increment(
    //     semver.parse(
    //         versionFile.match(versionPattern)?.[2] ?? '',
    //     ),
    //     release as semver.ReleaseType,
    // );

    // const version = `${major}.${minor}.${patch}`;

    try {
        parse(version);
    } catch {
        console.error(red(`version format not valid`));
        Deno.exit();
    }

    if (options.tag) {
        const r = await cmd('git', ['fetch']);
        if (!r.success) {
            console.error(red(`git auth required`));
            Deno.exit();
        }
    }

    if (options.npm) {
        const r = await cmd('npm', ['whoami']);
        if (!r.success) {
            console.error(red(`npm auth check failed`));
            Deno.exit();
        }
    }

    if (options.jsr) {
        const r = await cmd('deno', ['publish', '--dry-run']);
        if (!r.success) {
            console.error(red(`deno publish dry run failed`));
            Deno.exit();
        }
    }

    // await Deno.writeTextFile(versionPath, versionFile.replace(versionPattern, `$1${version}$3`));

    if (options.npm) {
        const pPath = resolve('./package.json');
        const pOld = await Deno.readTextFile(pPath);
        const pVersion = /("version":\s*")([0-9.]+)(")/;
        const pNew = pOld.replace(pVersion, `$1${version}$3`);
        await Deno.writeTextFile(pPath, pNew);
    }

    if (options.jsr) {
        const dPath = resolve('./deno.json');
        const dOld = await Deno.readTextFile(dPath);
        const dVersion = /("version":\s*")([0-9.]+)(")/;
        const dNew = dOld.replace(dVersion, `$1${version}$3`);
        await Deno.writeTextFile(dPath, dNew);
    }

    if (options.git) {
        await cmd('git', ['add', '.']);
        await cmd('git', ['commit', '-m', version]);
        await cmd('git', ['push']);
    }

    if (options.tag) {
        await cmd('git', ['tag', version]);
        await cmd('git', ['push', '--tag']);
    }

    if (options.npm) {
        await cmd('npm', ['publish']);
    }

    if (options.jsr) {
        await cmd('deno', ['publish']);
    }

    console.log(blue(`Published version: ${version}`));
};

export default publish;

if (import.meta.main) publish();
