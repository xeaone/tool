#!/usr/bin/env -S deno run --allow-read --allow-write

import { resolve } from 'https://deno.land/std@0.204.0/path/resolve.ts';
import { blue, red } from 'https://deno.land/std@0.204.0/fmt/colors.ts';
import * as semver from 'https://deno.land/std@0.204.0/semver/mod.ts';
import { parse } from 'https://deno.land/std@0.204.0/flags/mod.ts';
import versionImport from '../version.ts';

/**
 * Increments verions.ts with SemVer and publish to npm, git tag, and git commit.
 * @module
 */

const versionPattern = /^(.*?['"])([0-9.]+)(['"].*)$/m;
const releases = ['pre', 'major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease'];
const cmd = (cmd: string, args?: string[]) => new Deno.Command(cmd, { args }).spawn().output();

const helpText = `
    Version: ${versionImport}
    DESCRIPTION: Increments verions.ts with SemVer and publish to npm, git tag, and git commit.

    UNINSTALL: deno uninstall publish
    INSTALL: deno install --allow-read --allow-write --name publish https://deno.land/x/xtool/executable/publish.ts
    UPGRADE: deno install --allow-read --allow-write --name publish https://deno.land/x/xtool/executable/publish.ts -f

    USAGE:
        publish [METHOD] [OPTIONS]

    METHODS:
        pre
        major
        premajor
        minor
        preminor
        patch
        prepatch
        prerelease

    OPTIONS:
        --help          Prints help information
        --version       Prints version information

        --git           Creates git commit with version (defatul is true)
        --tag           Creates git tag with version (defatul is true)
        --npm           Publishes npm version  (defatul is true)


`;

export const publish = async function () {
    const options = parse(Deno.args, {
        boolean: [
            'git',
            'tag',
            'npm',
            'help',
            'version',
        ],
        default: {
            git: true,
            tag: true,
            npm: true,
            help: false,
            version: false,
        },
    });

    const [release] = options._ as string[];

    if (!release) {
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

    if (!releases.includes(release)) {
        console.error(red(`release required: ${releases.join(', ')}`));
        Deno.exit();
    }

    const versionPath = resolve('./version.ts');
    const versionFile = await Deno.readTextFile(versionPath).catch(() => {
        console.error(red(`requires ./version.ts -> export default '3.0.1';`));
        Deno.exit();
    });

    const { major, minor, patch } = semver.increment(
        semver.parse(
            versionFile.match(versionPattern)?.[2] ?? '',
        ),
        release as semver.ReleaseType,
    );

    const version = `${major}.${minor}.${patch}`;

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
            console.error(red(`npm auth required`));
            Deno.exit();
        }
    }

    if (options.npm) {
        const pkgPath = resolve('./package.json');
        const pkgOld = await Deno.readTextFile(pkgPath);
        const pkgVersion = /("version":\s*")([0-9.]+)(")/;
        const pkgNew = pkgOld.replace(pkgVersion, `$1${version}$3`);
        await Deno.writeTextFile(pkgPath, pkgNew);
    }

    await Deno.writeTextFile(versionPath, versionFile.replace(versionPattern, `$1${version}$3`));

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

    console.log(blue(`Published version: ${version}`));
};

export default publish;

if (import.meta.main) publish();
