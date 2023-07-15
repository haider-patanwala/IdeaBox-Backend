const ApiError = require("../utils/ApiError");

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  // if (err, req, res) just these 3 params r passed then express interprets err as req, req as res and res as next...
  // so to make understand express that it as a error handler only if 4 params are passed

  let HTTPStatusCode = 400;

  // creating a default json object to send as response.
  const responseObject = {
    message: "Internal Server Error.",
    error: err.message ? err.message : err.toString(),
  };

  // if the error occured by calling the class ApiError then update the existing parameters which we set above.
  if (err instanceof ApiError) {
    HTTPStatusCode = err.statusCode;
    responseObject.message = err.message;
    responseObject.error = err.err;
  }

  // sending the error response back to client
  return res.status(HTTPStatusCode).json({
    ...responseObject,
  });
};
