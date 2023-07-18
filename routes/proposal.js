const router = require("express").Router();
const { isDeveloperAuthenticated, roleBasedAuthentication } = require("../middleware/isAuthenticated");
const Proposal = require("../models/proposal");
const ApiError = require("../utils/ApiError");

router.route("/")
  // roleBasedAuthentication is a middlware powered by other 2 middlwares to conditionally verfy the authToken.
  .get(roleBasedAuthentication, (req, res, next) => {
    Proposal.find().populate("developer").populate("project")
      .then((documents) => {
        if (documents.length === 0) {
          // returns response of empty array with 'successful request' 200 code
          res.status(200).json({
            message: "No proposals data found. Insert some data please.",
            data: documents,
            errors: null,
          });
        } else {
          res.status(200).json({
            message: "Fetched proposals successfully.",
            data: documents,
            errors: null,
          });
        }
      })
      .catch((error) => next(new ApiError(422, "Error fetching proposals", error.toString())));
  })

  // isDeveloperAuthenticated is a middlware
  .post(isDeveloperAuthenticated, (req, res, next) => {
    const proposal = req.body;
    Proposal.create(proposal)
      .then((document) => {
        res.status(201).json({
          message: "Posted proposals successfully.",
          data: document,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(422, "Error creating proposal", error.toString())));
  });

router.route("/:uid")

  // isDeveloperAuthenticated is a middlware
  .patch(isDeveloperAuthenticated, (req, res, next) => {
    const updatedProposal = req.body;

    Proposal.findOneAndUpdate({ uid: req.params.uid }, { ...updatedProposal }, { new: true })
      .then((document) => {
        if (!document) {
          throw Error("Proposal not found.");
        }
        res.status(200).json({
          message: "Updated proposal successfully.",
          data: document,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(422, "Error updating proposal.", error.toString())));
  })

  // isDeveloperAuthenticated is a middlware
  .delete(isDeveloperAuthenticated, (req, res, next) => {
    Proposal.deleteOne({ uid: req.params.uid })
      .then((document) => {
        if (document.deletedCount === 0) {
          throw Error("Proposal not found.");
        }
        res.status(200).json({
          message: "Deleted proposal successfully.",
          data: document,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(422, "Error deleting proposal.", error.toString())));
  });

module.exports = router;
