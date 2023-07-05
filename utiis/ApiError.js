// ApiError is custom class inherited from the NodeJS class of Error
class ApiError extends Error {
  constructor(statusCode, message, err) {
    super(message); // used to call the contructor of Error class and set message.

    this.statusCode = statusCode;
    this.err = err;

    // capturing error stack for better debuggging
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
