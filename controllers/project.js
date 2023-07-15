const Project = require("../models/project");
const ApiError = require("../utils/ApiError");
const { deleteTmp } = require("../utils/deleteTmp");

const postProject = (res, next, project, file) => {
  Project.create(project)
    .then((document) => {
      res.status(201).json({
        message: "Created a project successfully.",
        data: document,
        errors: null,
      });
      if (file) {
        deleteTmp(file);
      }
    })
    // this error catching happens for any error occured inside the then(...) block.
    // error from this line of `Project.create(project)` will go back to the routes/project.js error handling mechanism
    .catch((error) => next(new ApiError(422, "Error creating project.", error.toString())));
};

const updateProject = (req, res, next, project, file) => {
  // respone bydefault comes an old document so giving new:true option to get a fresh updated document.
  Project.findOneAndUpdate({ uid: req.params.uid }, { ...project }, { new: true })
    .then((document) => {
      // findOneAndUpdate returns null if document is not found so using it to throw error.
      if (!document) {
        throw Error("Project not found.");
      }
      res.status(200).json({
        message: "Project updated succcessfully.",
        data: document,
        errors: null,
      });
      if (file) {
        deleteTmp(file);
      }
    })
    .catch((error) => next(new ApiError(422, "Error updating project.", error.toString())));
};

module.exports = {
  postProject,
  updateProject,
};
