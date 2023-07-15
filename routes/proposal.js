const router = require("express").Router();
const { isDeveloperAuthenticated, roleBasedAuthentication } = require("../middleware/isAuthenticated");
const Proposal = require("../models/proposal");
const ApiError = require("../utils/ApiError");

router.route("/")
  .get(roleBasedAuthentication, (req, res, next) => {
    Proposal.find().populate("developer").populate("project")
      .then((documents) => {
        res.status(200).json({
          message: "Fetched reviews successfully.",
          data: documents,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(400, "Error fetching proposals", error.toString())));
  })
  .post(isDeveloperAuthenticated, (req, res, next) => {
    const proposal = req.body;
    Proposal.create(proposal)
      .then((document) => {
        res.status(200).json({
          message: "Posted reviews successfully",
          data: document,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(400, "Error creating proposal", error.toString())));
  });

router.route("/:uid")
  .patch(isDeveloperAuthenticated, (req, res, next) => {
    const updatedProposal = req.body;

    Proposal.findOneAndUpdate({ uid: req.params.uid }, { ...updatedProposal }, { new: true })
      .then((document) => {
        if (!document) {
          throw Error("Proposal not found.");
        }
        res.status(200).json({
          message: "Updating proposal successfully",
          data: document,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(400, "Error updating proposal.", error.toString())));
  })
  .delete(isDeveloperAuthenticated, (req, res, next) => {
    Proposal.deleteOne({ uid: req.params.uid })
      .then((document) => {
        if (document.deletedCount === 0) {
          throw Error("Proposal not found.");
        }
        res.status(200).json({
          message: "Proposal deleted successfully",
          data: document,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(400, "Error deleting proposal.", error.toString())));
  });
module.exports = router;
