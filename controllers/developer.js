const Developer = require("../models/developer");
const ApiError = require("../utils/ApiError");
const { deleteTmp } = require("../utils/deleteTmp");

const registerDeveloper = (res, next, developer, file) => {
  Developer.create(developer)
    .then((document) => {
      res.status(201).json({
        message: "Developer created successfully.",
        data: document,
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

module.exports = {
  registerDeveloper,
};
