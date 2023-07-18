// ------------- THIS FILE HAS MULTIPLE CUSTOM FUNCTIONS TO VERIFY THE ACCESS TOKEN SENT BY CLINT FROM THE TTP REQUEST HEADERS------------

const jwt = require("jsonwebtoken");
const Developer = require("../models/developer");
const Organization = require("../models/organization");
const ApiError = require("../utils/ApiError");
require('dotenv').config();

const secret = process.env.JWT_SECRET;

const isDeveloperAuthenticated = (req, res, next) => {
  if (req.headers.authorization) {
    // also checking if the value of access token is right or not.
    const verification = jwt.verify(req.headers.authorization, secret);

    // the following should be used for testing as weirdly jwt.verify() was return 2 different kind of objects
    // return Developer.findOne({ email: verification })
    return Developer.findOne({ email: verification.email })
      .then((document) => {
        if (!document) {
          throw Error("Session expired. Please login again..");
        } else {
          return next();
        }
      })
      .catch((error) => next(new ApiError(422, "Error in authentication operation.", error.toString())));
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
  if (req.headers.authorization) {
    // also checking if the value of access token is right or not.
    const verification = jwt.verify(req.headers.authorization, secret);
    return Organization.findOne({ uid: verification.uid })
    // return Organization.findOne({ uid: verification })
      .then((document) => {
        if (!document) {
          throw Error("Session expired. Please login again.");
        } else {
          return next();
        }
      })
      .catch((error) => next(new ApiError(422, "Error in authentication operation.", error.toString())));
    // return res.status(200).json({
    //   redirect: true,
    // });
  }
  // return next();
  return res.status(400).json({
    redirect: false,
  });
};

// this middleware is to check if the given token belongs to which entity - Developer or Organization ?
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
        next(new ApiError(401, "Invalid authorization token type."));
      }
    } catch (error) {
      next(new ApiError(401, "Invalid authorization token."));
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
