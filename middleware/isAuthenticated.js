const jwt = require("jsonwebtoken");
const Developer = require("../models/developer");
const Organization = require("../models/organization");
const ApiError = require("../utils/ApiError");
require('dotenv').config();

const secret = process.env.JWT_SECRET;

const isDeveloperAuthenticated = (req, res, next) => {
  if (req.headers.authorization || req.headers.authorization === "null") {
    // also checking if the value of access token is right or not.
    const verification = jwt.verify(req.headers.authorization, secret);
    return Developer.findOne({ email: verification.email })
      .then((document) => {
        if (!document) {
          throw Error("Session expired. Please login again..");
        } else {
          return next();
        }
      })
      .catch((error) => next(new ApiError(422, "Error in operation.", error.toString())));
    // return res.status(200).json({
    //   redirect: true,
    // });
  }
  // return next();
  return res.status(400).json({
    redirect: false,
  });
};
const isOrganizationAuthenticated = (req, res, next) => {
  if (req.headers.authorization || req.headers.authorization === "null") {
    // also checking if the value of access token is right or not.
    const verification = jwt.verify(req.headers.authorization, secret);
    return Organization.findOne({ uid: verification.uid })
      .then((document) => {
        if (!document) {
          throw Error("Session expired. Please login again.");
        } else {
          return next();
        }
      })
      .catch((error) => next(new ApiError(422, "Error in operation.", error.toString())));
    // return res.status(200).json({
    //   redirect: true,
    // });
  }
  // return next();
  return res.status(400).json({
    redirect: false,
  });
};

const roleBasedAuthentication = (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    try {
      const decoded = jwt.verify(token, secret);
      if (decoded.email) {
        isDeveloperAuthenticated(req, res, next);
      } else if (decoded.uid) {
        isOrganizationAuthenticated(req, res, next);
      } else {
        next(new ApiError(401, "Invalid authorization token type"));
      }
    } catch (error) {
      next(new ApiError(401, "Invalid authorization token type."));
    }
  } else {
    next(new ApiError(400, "Missing authorization token."));
  }
};
module.exports = {
  isDeveloperAuthenticated,
  isOrganizationAuthenticated,
  roleBasedAuthentication,
};
