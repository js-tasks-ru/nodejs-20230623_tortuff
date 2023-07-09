const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.passed = 0;

    const limit = +options.limit;
    this.limit = !isNaN(limit) ? limit : 64 * 1024; // 64kb by default
    this.objectMode = Boolean(options.objectMode);
  }

  static createLimitSizeStream(options) {
    return new LimitSizeStream(options);
  }

  _transform(chunk, encoding, callback) {
    if (this.objectMode) {
      this.passed += 1;
    } else {
      const buffer = Buffer.from(chunk);
      this.passed += buffer.length;
    }

    if (this.passed > this.limit) {
      callback(new LimitExceededError());
    } else {
      callback(null, chunk);
    }
  }
}

module.exports = LimitSizeStream;
