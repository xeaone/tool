// const codes = Array.from({ length: 150 }, (_, index) => index);
// const chars = Array.from({ length: 150 }, (_, i) => String.fromCharCode(i));
// const translator = (0xffffffff + 1);

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

const generate = () => {
    const anyCodes: number[] = [];
    const upperCodes: number[] = [];
    const lowerCodes: number[] = [];
    const numberCodes: number[] = [];
    const symbolCodes: number[] = [];

    const anyStrings: string[] = [];
    const upperStrings: string[] = [];
    const lowerStrings: string[] = [];
    const symbolStrings: string[] = [];
    const numberStrings: string[] = [];

    for (let index = 0; index < 127; index++) {
        if (index >= upperStart && index <= upperEnd) {
            const string = String.fromCharCode(index);
            anyCodes.push(index);
            upperCodes.push(index);
            anyStrings.push(string);
            upperStrings.push(string);
        } else if (index >= lowerStart && index <= lowerEnd) {
            const string = String.fromCharCode(index);
            anyCodes.push(index);
            lowerCodes.push(index);
            anyStrings.push(string);
            lowerStrings.push(string);
        } else if (index >= numberStart && index <= numberEnd) {
            const string = String.fromCharCode(index);
            anyCodes.push(index);
            numberCodes.push(index);
            anyStrings.push(string);
            numberStrings.push(string);
        } else if (
            index >= symbol1Start && index <= symbol1End ||
            index >= symbol2Start && index <= symbol2End ||
            index >= symbol3Start && index <= symbol3End ||
            index >= symbol4Start && index <= symbol4End
        ) {
            const string = String.fromCharCode(index);
            anyCodes.push(index);
            symbolCodes.push(index);
            anyStrings.push(string);
            symbolStrings.push(string);
        }
    }

    console.log(anyStrings.join(''));
    console.log(upperStrings.join(''));
    console.log(lowerStrings.join(''));
    console.log(symbolStrings.join(''));
    console.log(numberStrings.join(''));
};
