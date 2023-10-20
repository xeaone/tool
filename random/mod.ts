// const symbol1Start = 33;
// const symbol1End = 47;

// const numberStart = 48;
// const numberEnd = 57;

// const symbol2Start = 58;
// const symbol2End = 64;

// const upperStart = 65;
// const upperEnd = 90;

// const symbol3Start = 91;
// const symbol3End = 96;

// const lowerStart = 97;
// const lowerEnd = 122;

// const symbol4Start = 123;
// const symbol4End = 126;

// const anyStart = 33;
// const anyEnd = 126;

// export const randomNumber = (): string => String.fromCharCode(randomInteger(numberStart, numberEnd));
// export const randomUpper = (): string => String.fromCharCode(randomInteger(upperStart, upperEnd));
// export const randomLower = (): string => String.fromCharCode(randomInteger(lowerStart, lowerEnd));
// export const randomAny = (): string => String.fromCharCode(randomInteger(anyStart, anyEnd));

const symbols = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lowers = 'abcdefghijklmnopqrstuvwxyz';
const numbers = '0123456789';

// export const randomInteger = (min = 0, max = 255): number => {
//     if (typeof min !== 'number') throw new Error('min number required');
//     if (typeof max !== 'number') throw new Error('max number required');
//     if (min === max) throw new Error('min and max must be different');
//     if (min > max) throw new Error('min must be less than max');
//     if (max > 255) throw new Error('max must be less than 256');

//     const bytes = new Uint8Array(1);

//     let result;
//     do {
//         result = crypto.getRandomValues(bytes)[0];
//     } while (result < min || result > max);

//     return result;
// };

/**
 * @link https://github.com/joepie91/node-random-number-csprng/blob/master/src/index.js
 * @link https://stackoverflow.com/questions/41437492/how-to-use-window-crypto-getrandomvalues-to-get-random-values-in-a-specific-rang
 * @link https://stackoverflow.com/questions/3956478/understanding-randomness
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */
export const randomInteger = (min: number, max: number): number => {
    if (typeof min !== 'number') throw new Error('min number required');
    if (typeof max !== 'number') throw new Error('max number required');
    if (min >= max) throw new Error('min must be less than max');

    const range = max - min + 1;
    const bits = Math.ceil(Math.log2(range));
    const bytes = Math.ceil(bits / 8);
    const mask = Math.pow(2, bits) - 1;
    const values = new Uint8Array(bytes);

    let value, index;
    do {
        window.crypto.getRandomValues(values);

        // bitwise OR and LeftShift operations
        // turn the bytes into an integer
        value = 0;
        for (index = 0; index < bytes; index++) {
            value = value | values[index] << (8 * index);
        }

        // bitwise AND operation
        // apply a mask to reduce the amount of attempts
        value = value & mask;
    } while (value < min || value > max);
    // } while (value >= range);

    // return value + min;
    return value;
};

/**
 * @description Generates a secure random string of configurable length which can include upper, lower, symbol, or number chars.
 * @param {Object}
 * @returns {String}
 */
export const randomString = ({
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
}): string => {
    if (typeof length !== 'number') throw new Error('length number required');
    if (typeof upper !== 'boolean') throw new Error('upper boolean required');
    if (typeof lower !== 'boolean') throw new Error('lower boolean required');
    if (typeof symbol !== 'boolean') throw new Error('symbol boolean required');
    if (typeof number !== 'boolean') throw new Error('number boolean required');

    if (length < 4) throw new Error('length must be greater than or equal to 4');
    if (!upper && !lower && !symbol && !number) throw new Error('upper, lower, symbol, or number required');

    const characters = [
        upper ? uppers : '',
        lower ? lowers : '',
        symbol ? symbols : '',
        number ? numbers : '',
    ].join('');

    const start = 0;
    const end = characters.length - 1;
    const result: string[] = [];

    while (result.length < length) {
        result.push(characters[randomInteger(start, end)]);
    }

    // if (upper) result[randomInteger(0, length - 1)] = uppers[randomInteger(0, uppers.length - 1)];
    // if (lower) result[randomInteger(0, length - 1)] = lowers[randomInteger(0, lowers.length - 1)];
    // if (symbol) result[randomInteger(0, length - 1)] = symbols[randomInteger(0, symbols.length - 1)];
    // if (number) result[randomInteger(0, length - 1)] = numbers[randomInteger(0, numbers.length - 1)];

    return result.join('');
};
