function sum(a, b) {
  if (isNumber(a) && isNumber(b)) {
    return a + b;
  } else {
    throw new TypeError('Some argument is incorrect.');
  }
}

function isNumber(num) {
  return typeof num === 'number' && !isNaN(num);
}

module.exports = sum;
