const ApiError = require("../utils/ApiError");

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  // if (err, req, res) just these 3 params r passed then express interprets err as req, req as res and res as next...
  // so to make understand express that it as a error handler only if 4 params are passed

  let HTTPStatusCode = 400;

  const responseObject = {
    message: "Internal Server Error.",
    error: err.message ? err.message : err.toString(),
  };

  if (err instanceof ApiError) {
    HTTPStatusCode = err.statusCode;
    responseObject.error = err.err;
    responseObject.message = err.message;
  }

  return res.status(HTTPStatusCode).json({
    ...responseObject,
  });
};
