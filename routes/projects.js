const router = require("express").Router();
const Project = require("../models/project");
const ApiError = require("../utiis/ApiError");

router.route("/")
  .get((req, res, next) => {
    Project.find()
      .then((documents) => {
        res.status(200).json({
          message: "Projects fetched succcessfully",
          data: documents,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(400, "Error fetching projects.", error.toString())));
  })

  .post((req, res, next) => {
    const project = req.body;

    return Project.create(project)
      .then((document) => {
        res.status(201).json({
          message: "Created a project successfully.",
          data: document,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(422, "Error creating project.", error.toString())));
  });

router.route("/:uid")
  .get((req, res, next) => {
    Project.findOne({ uid: req.params.uid })
      .then((document) => {
        if (!document) {
          throw Error("Project not found");
        }
        res.status(200).json({
          message: "Fetched project successfully.",
          data: document,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(400, "Error fetching project.", error.toString())));
  })

  .patch((req, res, next) => {
    const project = req.body;
    Project.findOneAndUpdate({ uid: req.params.uid }, { ...project }, { new: true })
      .then((document) => {
        if (!document) {
          throw Error("Project not found.");
        }
        res.status(200).json({
          message: "Project updated succcessfully.",
          data: document,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(422, "Error updating project.", error.toString())));
  })

  .delete((req, res, next) => {
    Project.deleteOne({ uid: req.params.uid })
      .then((document) => {
        // deleteOne method doesnt return the found/deleted document
        // but it returns a key `deletedCount` with value 0 or 1
        // so if it is 0 means nothing was deleted means the documen was not found to delete.
        if (!document.deletedCount) {
          throw Error("Project not found.");
        }
        res.status(200).json({
          message: "Deleted project successfully.",
          data: document,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(400, "Error deleting project.", error.toString())));
  });

module.exports = router;
