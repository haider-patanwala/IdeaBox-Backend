const express = require("express");
const Developer = require("../models/developer");
const ApiError = require("../utiis/ApiError");

// initializing the router with express router
const router = express.Router();

router.route("/")
  .get((req, res, next) => {
    Developer.find()
      .then((documents) => {
        res.status(200).json({
          message: "Developers fetched successfully",
          data: documents,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(400, "Error fetching developers.", error.toString())));
  });

router.route("/auth/register")
  .post((req, res, next) => {
    const developer = req.body;

    return Developer.create(developer)
      .then((document) => res.status(201).json({
        message: "Developer created successfully.",
        data: document,
        errors: null,
      }))
      .catch((error) => next(new ApiError(422, "Error creating developer.", error.toString())));
  });

router.route("/:uid")
  .get((req, res, next) => {
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
      .catch((error) => next(new ApiError(400, "Error fetching developer.", error.toString())));
  })

  .patch((req, res, next) => {
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
      .catch((error) => next(new ApiError(422, "Error updating developer.", error.toString())));
  })

  .delete((req, res, next) => {
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
      .catch((error) => next(new ApiError(400, "Error deleting developer.", error.toString())));
  });
module.exports = router;
