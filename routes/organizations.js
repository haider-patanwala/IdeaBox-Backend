const router = require("express").Router();
const Organization = require("../models/organization");

router.route("/")
  .get((req, res) => {
    Organization.find()
      .then((documents) => {
        res.status(200).json({
          message: "Fetched organization successfully.",
          data: documents,
          errors: null,
        });
      })
      .catch((error) => {
        res.status(400).json({
          message: "Error fetching organizations.",
          data: null,
          errors: error,
        });
      });
  })

  .post((req, res) => {
    const organization = req.body;
    Organization.create(organization)
      .then((document) => {
        res.status(201).json({
          message: "Organization created successfully.",
          data: document,
          errors: null,
        });
      })
      .catch((error) => {
        res.status(400).json({
          message: "Error creating organization.",
          data: null,
          errors: error,
        });
      });
  });

router.route("/:uid")
  .get((req, res) => {
    Organization.findOne({ uid: req.params.uid })
      .then((document) => {
        if (!document) {
          throw Error("Organization not found.");
        }
        res.status(200).json({
          message: "Fetched organization successfully",
          data: document,
          errors: null,
        });
      })
      .catch((error) => {
        res.status(422).json({
          message: "Error fetching organization.",
          data: null,
          errors: error,
        });
      });
  })

  .patch((req, res) => {
    const organization = req.body;

    Organization.findOneAndUpdate({ uid: req.params.uid }, { ...organization }, { new: true })
      .then((document) => {
        if (!document) {
          throw Error("Organization not found.");
        }
        return res.status(200).json({
          message: "Updated organization successfully.",
          data: document,
          errors: null,
        });
      })
      .catch((error) => {
        res.status(400).json({
          message: "Error updating organization.",
          data: null,
          errors: error,
        });
      });
  })
  .delete((req, res) => {
    Organization.findOneAndDelete({ uid: req.params.uid })
      .then((document) => {
        if (!document) {
          throw Error("Organization not found");
        }
        return res.status(200).json({
          message: "Deleted organization successfully.",
          data: document,
          errors: null,
        });
      })
      .catch((error) => {
        res.status(400).json({
          message: "Error deleting organization",
          data: null,
          errors: error,
        });
      });
  });

module.exports = router;
