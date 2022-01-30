class CustomError extends Error {
  constructor(message, statusCode, errors) {
    super(message);
    this.stateCode = statusCode;
    this.errors = errors
  }
}

module.exports = CustomError;