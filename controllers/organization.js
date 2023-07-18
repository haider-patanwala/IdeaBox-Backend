const jwt = require("jsonwebtoken");
const Organization = require("../models/organization");
const ApiError = require("../utils/ApiError");
const { deleteTmp } = require("../utils/deleteTmp");
require('dotenv').config();

const secret = process.env.JWT_SECRET;

const postOrganization = (res, next, organization, file) => {
  Organization.create(organization)
    .then((document) => {
      const uidObj = {
        uid: document.uid,
      };
      const token = jwt.sign(uidObj, secret);
      res.status(201).json({
        message: "Organization created successfully.",
        data: {
          access_token: token,
          organization: document,
        },
        errors: null,
      });
      if (file) {
        deleteTmp(file);
      }
    })
    // this error catching happens for any error occured inside this then(...) block.
    // error from this line of `Organization.create(organization)` will go back to the routes/organization.js error handling mechanism
    .catch((error) => {
      next(new ApiError(422, "Error creating organization.", error.toString()));
    });
};

const updateOrganiztion = (req, res, next, organization, file) => {
  // respone bydefault comes an old document so giving new:true option to get a fresh updated document.
  Organization.findOneAndUpdate({ uid: req.params.uid }, { ...organization }, { new: true })
    .then((document) => {
      // findOneAndUpdate returns null if document is not found so using it to throw error.
      if (!document) {
        throw Error("Organization not found.");
      }
      res.status(200).json({
        message: "Updated organization successfully.",
        data: document,
        errors: null,
      });
      if (file) {
        deleteTmp(file);
      }
    })
    .catch((error) => next(new ApiError(422, "Error updating organization.", error.toString())));
};
module.exports = {
  postOrganization,
  updateOrganiztion,
};
