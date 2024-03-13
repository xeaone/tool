import { assertLess, assertMatch } from '../deps.ts';
import { randomInteger, randomString } from './mod.ts';

const symbols = '!"#$%&\'()*+,-./:;<=>?@\\[\\\\\\]^_`{|}~';
const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lowers = 'abcdefghijklmnopqrstuvwxyz';
const numbers = '0123456789';

const pattern = (
    {
        length = 8,
        upper = true,
        lower = true,
        symbol = true,
        number = true,
    }: {
        length?: number;
        upper?: boolean;
        lower?: boolean;
        symbol?: boolean;
        number?: boolean;
    } = {
        length: 8,
        upper: true,
        lower: true,
        symbol: true,
        number: true,
    },
) => new RegExp(
    `^[${upper ? uppers : ''}${lower ? lowers : ''}${symbol ? symbols : ''}${number ? numbers : ''}]{${length}}$`,
);

Deno.test('random default', () => {
    const result = randomString();
    console.log(result);
    assertMatch(result, pattern());
});

Deno.test('random 10 default', () => {
    const options = { length: 10 };
    const result = randomString(options);
    console.log(result);
    assertMatch(result, pattern(options));
});

Deno.test('random 10 all', () => {
    const options = { length: 10, upper: true, lower: true, number: true, symbol: true };
    const result = randomString(options);
    console.log(result);
    assertMatch(result, pattern(options));
});

Deno.test('random 10 upper', () => {
    const options = { length: 10, upper: true, lower: false, number: false, symbol: false };
    const result = randomString(options);
    console.log(result);
    assertMatch(result, pattern(options));
});

Deno.test('random 10 lower', () => {
    const options = { length: 10, upper: false, lower: true, number: false, symbol: false };
    const result = randomString(options);
    console.log(result);
    assertMatch(result, pattern(options));
});

Deno.test('random 10 number', () => {
    const options = { length: 10, upper: false, lower: false, number: true, symbol: false };
    const result = randomString(options);
    console.log(result);
    assertMatch(result, pattern(options));
});

Deno.test('random 10 symbol', () => {
    const options = { length: 10, upper: false, lower: false, number: false, symbol: true };
    const result = randomString(options);
    console.log(result);
    assertMatch(result, pattern(options));
});

Deno.test('random 4 symbol number', () => {
    const options = { length: 4, upper: false, lower: false, number: true, symbol: true };
    const result = randomString(options);
    console.log(result);
    assertMatch(result, pattern(options));
});

Deno.test('collision 4 lower 100_000', () => {
    const options = { length: 8, upper: false, lower: true, number: false, symbol: false };

    const results: string[] = [];
    const collision: string[] = [];

    for (let index = 0; index < 100_000; index++) {
        const random = randomString(options);
        if (results.includes(random)) collision.push(random);
        else results.push(random);
    }

    console.log('results: ', results.length);
    console.log('collision: ', collision.length);
    assertLess(collision.length, 1);
});

Deno.test('collision 8 all 100_000', () => {
    const options = { length: 8, upper: true, lower: true, number: true, symbol: true };

    const results: string[] = [];
    const collision: string[] = [];

    for (let index = 0; index < 100_000; index++) {
        const random = randomString(options);
        if (results.includes(random)) collision.push(random);
        else results.push(random);
    }

    console.log('results: ', results.length);
    console.log('collision: ', collision.length);
    assertLess(collision.length, 1);
});

Deno.test('distribution', () => {
    const data: Record<number, number> = {};

    for (let i = 0; i < 2_000_000; ++i) {
        const random = randomInteger(10, 30);
        if (data[random] === undefined) {
            data[random] = 1;
        } else {
            data[random] += 1;
        }
    }

    console.log(data);
});

// Deno.test('collision all 1,000,000', () => {
//     const options = { length: 8, upper: true, lower: true, number: true, symbol: true };

//     const results: string[] = [];
//     const collision: string[] = [];

//     for (let index = 0; index < 1_000_000; index++) {
// const random = randomString(options);
// if (results.includes(random)) collision.push(random);
// else results.push(random);
//     }

//     console.log('results: ', results.length);
//     console.log('collision: ', collision.length);
//     assertLess(collision.length, 1);
// });
