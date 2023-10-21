
/*
    license: MIT
    version: 3.5.3
    author: Alexander Elias
    repository: https://github.com/xeaone/tool
*/


// random/mod.ts
var symbols = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
var uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var lowers = "abcdefghijklmnopqrstuvwxyz";
var numbers = "0123456789";
var randomInteger = (min, max) => {
  if (typeof min !== "number")
    throw new Error("min number required");
  if (typeof max !== "number")
    throw new Error("max number required");
  if (min >= max)
    throw new Error("min must be less than max");
  const range = max - min + 1;
  const bits = Math.ceil(Math.log2(range));
  const bytes = Math.ceil(bits / 8);
  const mask = Math.pow(2, bits) - 1;
  const values = new Uint8Array(bytes);
  let value, index;
  do {
    window.crypto.getRandomValues(values);
    value = 0;
    for (index = 0; index < bytes; index++) {
      value = value | values[index] << 8 * index;
    }
    value = value & mask;
  } while (value < min || value > max);
  return value;
};
var randomString = ({
  length = 8,
  upper = true,
  lower = true,
  symbol = true,
  number = true
} = {
  length: 8,
  upper: true,
  lower: true,
  symbol: true,
  number: true
}) => {
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
  if (length < 4)
    throw new Error("length must be greater than or equal to 4");
  if (!upper && !lower && !symbol && !number)
    throw new Error("upper, lower, symbol, or number required");
  const characters = [
    upper ? uppers : "",
    lower ? lowers : "",
    symbol ? symbols : "",
    number ? numbers : ""
  ].join("");
  const startCharacterIndex = 0;
  const endCharacterIndex = characters.length - 1;
  const positions = [];
  const result = [];
  for (let index = 0; index < length; index++) {
    positions.push(index);
    result.push(characters[randomInteger(startCharacterIndex, endCharacterIndex)]);
  }
  if (upper) {
    const positionInteger = randomInteger(0, positions.length - 1);
    const [resultInteger] = positions.splice(positionInteger, 1);
    result[resultInteger] = uppers[randomInteger(0, uppers.length - 1)];
  }
  if (lower) {
    const positionInteger = randomInteger(0, positions.length - 1);
    const [resultInteger] = positions.splice(positionInteger, 1);
    result[resultInteger] = lowers[randomInteger(0, lowers.length - 1)];
  }
  if (symbol) {
    const positionInteger = randomInteger(0, positions.length - 1);
    const [resultInteger] = positions.splice(positionInteger, 1);
    result[resultInteger] = symbols[randomInteger(0, symbols.length - 1)];
  }
  if (number) {
    const positionInteger = randomInteger(0, positions.length - 1);
    const [resultInteger] = positions.splice(positionInteger, 1);
    result[resultInteger] = numbers[randomInteger(0, numbers.length - 1)];
  }
  return result.join("");
};
var mod_default = {
  integer: randomInteger,
  string: randomString
};
export {
  mod_default as default,
  randomInteger,
  randomString
};
//# sourceMappingURL=mod.js.map
