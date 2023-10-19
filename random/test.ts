import { assertMatch } from 'https://deno.land/std@0.204.0/assert/mod.ts';
import { random } from './mod.ts';

const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lowers = 'abcdefghijklmnopqrstuvwxyz';
const symbols = '!"#$%&\'()*+,-./:;<=>?@\\[\\]\\^_`{|}~';
const numbers = '0123456789';

const pattern = (
    { length = 8, upper = true, lower = true, symbol = true, number = true }: { length?: number; upper?: boolean; lower?: boolean; symbol?: boolean; number?: boolean } = { length: 8, upper: true, lower: true, symbol: true, number: true },
) => {
    return new RegExp(`^[${upper ? uppers : ''}${lower ? lowers : ''}${symbol ? symbols : ''}${number ? numbers : ''}]{${length}}$`);
};

Deno.test('random default', () => {
    const result = random();
    assertMatch(result, pattern());
});

Deno.test('random 10 default', () => {
    const options = { length: 10 };
    const result = random(options);
    assertMatch(result, pattern(options));
});

Deno.test('random 10 any', () => {
    const options = { length: 10, upper: true, lower: true, number: true, symbol: true };
    const result = random(options);
    assertMatch(result, pattern(options));
});

Deno.test('random 10 upper', () => {
    const options = { length: 10, upper: true, lower: false, number: false, symbol: false };
    const result = random(options);
    assertMatch(result, pattern(options));
});

Deno.test('random 10 lower', () => {
    const options = { length: 10, upper: false, lower: true, number: false, symbol: false };
    const result = random(options);
    assertMatch(result, pattern(options));
});

Deno.test('random 10 number', () => {
    const options = { length: 10, upper: false, lower: false, number: true, symbol: false };
    const result = random(options);
    assertMatch(result, pattern(options));
});

Deno.test('random 10 symbol', () => {
    const options = { length: 10, upper: false, lower: false, number: false, symbol: true };
    const result = random(options);
    assertMatch(result, pattern(options));
});
