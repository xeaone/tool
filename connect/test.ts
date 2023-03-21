import { Google } from './mod.ts';

const env = Deno.env.toObject();

if (!env.key) throw new Error('key required');
if (!env.project) throw new Error('project required');

if (!env.bucket) throw new Error('bucket required');
if (!env.object) throw new Error('object required');

const bucket = env.bucket;
const object = env.object;
const project = env.project;
const key = JSON.parse(await Deno.readTextFile(env.key));

const connect = new Google({ key, project });

const result = await connect.fetch('GET', `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${object}`, {
    alt: 'media'
});

console.log(await result.text());
