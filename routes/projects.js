const router = require("express").Router();
const Project = require("../models/project");

router.route("/")
  .get((req, res) => {
    Project.find()
      .then((documents) => {
        res.status(200).json({
          message: "Projects fetched succcessfully",
          data: documents,
          errors: null,
        });
      })
      .catch((error) => {
        res.status(400).json({
          message: "Error fetching projects.",
          document: null,
          errors: error,
        });
      });
  })

  .post((req, res) => {
    const project = req.body;

    return Project.create(project)
      .then((document) => {
        res.status(201).json({
          message: "Created a project successfully.",
          data: document,
          errors: null,
        });
      })
      .catch((error) => {
        res.status(400).json({
          message: "Error creating project.",
          data: null,
          errors: error,
        });
      });
  });

router.route("/:uid")
  .get((req, res) => {
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
      .catch((error) => {
        res.status(400).json({
          message: "Error fetching project",
          data: null,
          errors: error,
        });
      });
  })

  .patch((req, res) => {
    const project = req.body;
    Project.findOneAndUpdate({ uid: req.params.uid }, { ...project }, { new: true })
      .then((document) => {
        res.status(201).json({
          message: "Project updated succcessfully.",
          data: document,
          errors: null,
        });
      })
      .catch((error) => {
        res.status(400).json({
          message: "Error updating project.",
          data: null,
          errors: error,
        });
      });
  })

  .delete((req, res) => {
    Project.deleteOne({ uid: req.params.uid })
      .then((document) => {
        res.status(200).json({
          message: "Deleted project successfully.",
          data: document,
          errors: null,
        });
      })
      .catch((error) => {
        res.status(400).json({
          message: "Error deleting project",
          data: null,
          errors: error,
        });
      });
  });

module.exports = router;
