const router = require("express").Router();
const { isDeveloperAuthenticated, roleBasedAuthentication } = require("../middleware/isAuthenticated");
const Proposal = require("../models/proposal");
const ApiError = require("../utils/ApiError");

router.route("/")
  // roleBasedAuthentication is a middlware powered by other 2 middlwares to conditionally verfy the authToken.
  .get(roleBasedAuthentication, (req, res, next) => {
    let queryObject;
    const { developer, project } = req.query;

    // FILTERING BASED ON 2 KEYS - developer and projects
    if (developer) {
      queryObject = developer;
    }
    if (project) {
      queryObject = project;
    }

    Proposal.find().populate("developer", "fname lname email profile_pic uid").populate("project", "title uid thumbnail")
      .then((documents) => {
        // once we get all the documents the filter the data based on query parameter key and value
        let filteredDocs;
        if (queryObject) {
          filteredDocs = documents.filter((doc) => {
            if (developer) { // FILTER SPECIFIC DEV
              return doc.developer.uid === queryObject;
            }
            // FILTER SPECIFIC PROJECT
            return doc.project.uid === queryObject;
          });
        } else {
          // NO FILTER
          filteredDocs = documents;
        }
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
            data: filteredDocs,
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
