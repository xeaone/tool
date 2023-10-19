
const symbol1Start = 33;
const symbol1End = 47;

const numberStart = 48;
const numberEnd = 57;

const symbol2Start = 58;
const symbol2End = 64;

const upperStart = 65;
const upperEnd = 90;

const symbol3Start = 91;
const symbol3End = 96;

const lowerStart = 97;
const lowerEnd = 122;

const symbol4Start = 123;
const symbol4End = 126;

const anyStart = 33;
const anyEnd = 126;

const translator = 2 ** 32;

export const randomFloat = (): number => {
    return window.crypto.getRandomValues(new Uint32Array(1))[ 0 ] / translator;
};

export const randomInteger = (min: number, max: number): number => {
    if (typeof min !== 'number') throw new Error('min number required');
    if (typeof max !== 'number') throw new Error('max number required');
    if (min >= max) throw new Error('min must be less than max');
    return Math.floor(randomFloat() * (max - min) + min);
};

export const randomNumber = (): string => String.fromCharCode(randomInteger(numberStart, numberEnd));

export const randomUpper = (): string => String.fromCharCode(randomInteger(upperStart, upperEnd));

export const randomLower = (): string => String.fromCharCode(randomInteger(lowerStart, lowerEnd));

export const randomAny = (): string => String.fromCharCode(randomInteger(anyStart, anyEnd));

/**
 * @description Generates a random string of configurable length with upper, lower, symbol, or number chars.
 * @param {Object}
 * @returns {String}
 */
export const random = (
    { length = 8, upper = true, lower = true, symbol = true, number = true, }:
        { length?: number, upper?: boolean, lower?: boolean, symbol?: boolean, number?: boolean, } =
        { length: 8, upper: true, lower: true, symbol: true, number: true, }
): string => {

    if (!length) throw new Error('length number required');
    if (typeof length !== 'number') throw new Error('length number required');
    if (typeof upper !== 'boolean') throw new Error('upper boolean required');
    if (typeof lower !== 'boolean') throw new Error('lower boolean required');
    if (typeof symbol !== 'boolean') throw new Error('symbol boolean required');
    if (typeof number !== 'boolean') throw new Error('number boolean required');
    if (!upper && !lower && !symbol && !number) throw new Error('upper, lower, symbol, or number required');

    let result = '';

    while (length) {
        const integer = randomInteger(anyStart, anyEnd);

        if (upper && integer >= upperStart && integer <= upperEnd) {
            result += String.fromCharCode(integer);
            length--;
        } else if (lower && integer >= lowerStart && integer <= lowerEnd) {
            result += String.fromCharCode(integer);
            length--;
        } else if (number && integer >= numberStart && integer <= numberEnd) {
            result += String.fromCharCode(integer);
            length--;
        } else if (symbol && (
            integer >= symbol1Start && integer <= symbol1End ||
            integer >= symbol2Start && integer <= symbol2End ||
            integer >= symbol3Start && integer <= symbol3End ||
            integer >= symbol4Start && integer <= symbol4End
        )) {
            result += String.fromCharCode(integer);
            length--;
        }

    }

    return result;
};
