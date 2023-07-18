const jwt = require("jsonwebtoken");
const Developer = require("../models/developer");
const ApiError = require("../utils/ApiError");
const { deleteTmp } = require("../utils/deleteTmp");
require('dotenv').config();

const secret = process.env.JWT_SECRET;

const registerDeveloper = (res, next, developer, file) => {
  Developer.create(developer)
    .then((document) => {
      const emailObj = {
        email: document.email,
      };
      const token = jwt.sign(emailObj, secret);
      res.status(201).json({
        message: "Developer created successfully.",
        data: {
          access_token: token,
          developer: document,
        },
        errors: null,
      });
      if (file) {
        deleteTmp(file);
      }
    })
    // this error catching happens for any error occured inside the then(...) block.
    // error from this line of `Developer.create(developer)` will go back to the routes/developer.js error handling mechanism
    .catch((error) => next(new ApiError(422, "Error creating developer.", error.toString())));
};

const updateDeveloper = (req, res, next, developer, file) => {
  // respone bydefault comes an old document so giving new:true option to get a fresh updated document.
  Developer.findOneAndUpdate({ uid: req.params.uid }, { ...developer }, { new: true })
    .then((document) => {
      // findOneAndUpdate returns null if document is not found so using it to throw error.
      if (!document) {
        throw Error("Developer not found.");
      }
      res.status(200).json({
        message: "Developer updated successfully.",
        data: document,
        errors: null,
      });
      if (file) {
        deleteTmp(file);
      }
    })
    .catch((error) => next(new ApiError(422, "Error updating developer.", error.toString())));
};
module.exports = {
  registerDeveloper,
  updateDeveloper,
};
