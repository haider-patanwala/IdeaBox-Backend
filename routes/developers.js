const express = require("express");
const Developer = require("../models/developer");

// initializing the router with express router
const router = express.Router();

router.route("/")
  .get((req, res) => {
    Developer.find()
      .then((documents) => {
        res.status(200).json({
          message: "Developers fetched successfully",
          data: documents,
          errors: null,
        });
      })
      .catch((error) => res.status(400).json({
        message: "Error fetching developers.",
        data: null,
        errors: error,
      }));
  });

router.route("/auth/register")
  .post((req, res) => {
    const developer = req.body;

    return Developer.create(developer)
      .then((document) => res.status(201).json({
        message: "Developer created successfully.",
        data: document,
        errors: null,
      }))
      .catch((error) => res.status(422).json({
        message: "Error creating developer.",
        data: null,
        errors: error,
      }));
  });

router.route("/:uid")
  .get((req, res) => {
    Developer.findOne({ uid: req.params.uid })
      .then((document) => {
        if (!document) {
          throw Error("Developer doesn't exist");
        }
        res.status(200).json({
          message: "Developer fetched",
          data: document,
          errors: null,
        });
      })
      .catch((error) => res.status(400).json({
        message: "Error fetching developer",
        data: null,
        errors: error,
      }));
  })

  .patch((req, res) => {
    const developer = req.body;

    // respone bydefault comes an old document so giving new:true option to get a fresh updated document.
    Developer.findOneAndUpdate({ uid: req.params.uid }, { ...developer }, { new: true })
      .then((document) => {
        if (!document) {
          throw Error("Developer not found.");
        }

        return res.status(200).json({
          message: "Developer Updated",
          data: document,
          errors: null,
        });
      })
      .catch((error) => res.status(422).json({
        message: "Error updating developer.",
        data: null,
        errors: error,
      }));
  })

  .delete((req, res) => {
    Developer.deleteOne({ uid: req.params.uid })
      .then((document) => {
        if (document.deletedCount === 0) {
          throw Error("Developer not found.");
        }
        return res.status(200).json({
          message: "Developer deleted successfully.",
          data: document,
          errors: null,
        });
      })
      .catch((error) => res.status(400).json({
        message: "Error deleting developer.",
        data: null,
        errors: error,
      }));
  });
module.exports = router;
