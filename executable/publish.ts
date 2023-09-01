#!/usr/bin/env -S deno run --allow-read --allow-write

import { resolve } from 'https://deno.land/std@0.201.0/path/resolve.ts';
import { blue, red } from 'https://deno.land/std@0.201.0/fmt/colors.ts';
import * as semver from 'https://deno.land/std@0.201.0/semver/mod.ts';
import { parse } from 'https://deno.land/std@0.201.0/flags/mod.ts';

/**
 * Increments verions.ts with SemVer and publish to npm, git tag, and git commit.
 * @module
 */

const versionPattern = /^(.*?['"])([0-9.]+)(['"].*)$/m;
const releases = ['pre', 'major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease'];
const cmd = (cmd: string, args?: string[]) => new Deno.Command(cmd, { args }).spawn().output();

const helpText = `
    DESCRIPTION:
        Increments verions.ts with SemVer and publish to npm, git tag, and git commit.

    INSTALL:
        deno install --allow-read --allow-write https://deno.land/x/xtool/executable/publish.ts

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
        ],
        default: {
            git: true,
            tag: true,
            npm: true,
            help: false,
        }
    });

    const [release] = options._ as string[];
    const { help, git, tag, npm } = options;

    if (help || !release) {
        console.log(helpText);
        Deno.exit();
    }

    if (!releases.includes(release)) {
        console.error(red(`release required: ${releases.join(', ')}`));
        Deno.exit();
    }

    const versionFile = await Deno.readTextFile(resolve('./version.ts')).catch(() => {
        console.error(red(`requires ./version.ts -> export default '3.0.1';`));
        Deno.exit();
    });

    const { major, minor, patch } = semver.increment(
        semver.parse(
            versionFile.match(versionPattern)?.[2] ?? ''
        ),
        release as semver.ReleaseType
    );

    const version = `${major}.${minor}.${patch}`;

    if (tag) {
        const r = await cmd('git', ['fetch']);
        if (!r.success) {
            console.error(red(`git auth required`));
            Deno.exit();
        }
    }

    if (npm) {
        const r = await cmd('npm', ['whoami']);
        if (!r.success) {
            console.error(red(`npm auth required`));
            Deno.exit();
        }
    }

    if (npm) {
        const pkg = JSON.parse(await Deno.readTextFile(resolve('./package.json')));
        pkg.version = version;
        await Deno.writeTextFile(resolve('./package.json'), JSON.stringify(pkg, null, '\t'));
    }

    await Deno.writeTextFile(resolve('./version.ts'), versionFile.replace(versionPattern, `$1${version}$3`));

    if (git) {
        await cmd('git', ['add', '.']);
        await cmd('git', ['commit', '-m', version]);
        await cmd('git', ['push']);
    }

    if (tag) {
        await cmd('git', ['tag', version]);
        await cmd('git', ['push', '--tag']);
    }

    if (npm) {
        await cmd('npm', ['publish']);
        // await cmd('npm', ['publish', '--access', 'public']);
    }

    console.log(blue(`Published version: ${version}`));
}

export default publish;

if (import.meta.main) publish();