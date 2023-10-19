
/*
    license: MIT
    version: 3.3.0
    author: Alexander Elias
    repository: https://github.com/xeaone/tool
*/


// random/mod.ts
var symbol1Start = 33;
var symbol1End = 47;
var numberStart = 48;
var numberEnd = 57;
var symbol2Start = 58;
var symbol2End = 64;
var upperStart = 65;
var upperEnd = 90;
var symbol3Start = 91;
var symbol3End = 96;
var lowerStart = 97;
var lowerEnd = 122;
var symbol4Start = 123;
var symbol4End = 126;
var anyStart = 33;
var anyEnd = 126;
var translator = 2 ** 32;
var randomFloat = () => {
  return window.crypto.getRandomValues(new Uint32Array(1))[0] / translator;
};
var randomInteger = (min, max) => {
  if (typeof min !== "number")
    throw new Error("min number required");
  if (typeof max !== "number")
    throw new Error("max number required");
  if (min >= max)
    throw new Error("min must be less than max");
  return Math.floor(randomFloat() * (max - min) + min);
};
var randomNumber = () => String.fromCharCode(randomInteger(numberStart, numberEnd));
var randomUpper = () => String.fromCharCode(randomInteger(upperStart, upperEnd));
var randomLower = () => String.fromCharCode(randomInteger(lowerStart, lowerEnd));
var randomAny = () => String.fromCharCode(randomInteger(anyStart, anyEnd));
var random = ({ length = 8, upper = true, lower = true, symbol = true, number = true } = { length: 8, upper: true, lower: true, symbol: true, number: true }) => {
  if (!length)
    throw new Error("length number required");
  if (typeof length !== "number")
    throw new Error("length number required");
  if (typeof upper !== "boolean")
    throw new Error("upper boolean required");
  if (typeof lower !== "boolean")
    throw new Error("lower boolean required");
  if (typeof symbol !== "boolean")
    throw new Error("symbol boolean required");
  if (typeof number !== "boolean")
    throw new Error("number boolean required");
  if (!upper && !lower && !symbol && !number)
    throw new Error("upper, lower, symbol, or number required");
  let result = "";
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
    } else if (symbol && (integer >= symbol1Start && integer <= symbol1End || integer >= symbol2Start && integer <= symbol2End || integer >= symbol3Start && integer <= symbol3End || integer >= symbol4Start && integer <= symbol4End)) {
      result += String.fromCharCode(integer);
      length--;
    }
  }
  return result;
};
export {
  random,
  randomAny,
  randomFloat,
  randomInteger,
  randomLower,
  randomNumber,
  randomUpper
};
//# sourceMappingURL=mod.js.map
