const Organization = require("../models/organization");
const ApiError = require("../utils/ApiError");
const { deleteTmp } = require("../utils/deleteTmp");

const postOrganization = (res, next, organization, file) => {
  Organization.create(organization)
    .then((document) => {
      res.status(201).json({
        message: "Organization created successfully.",
        data: document,
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

module.exports = {
  postOrganization,
};
