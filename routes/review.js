const router = require("express").Router();
const { roleBasedAuthentication } = require("../middleware/isAuthenticated");
const Review = require("../models/review");
const ApiError = require("../utils/ApiError");

router.route("/")
  .get((req, res, next) => {
    Review.find()
      .then((documents) => {
        res.status(200).json({
          message: "Fetched reviews succesfully.",
          data: documents,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(400, "Error fetching reviews.", error.toString())));
  })
  .post(roleBasedAuthentication, (req, res, next) => {
    const review = req.body;
    Review.create(review)
      .then((document) => {
        res.status(201).json({
          message: "Review posted successfully",
          data: document,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(422, "Error posting review", error.toString())));
  });

router.route("/:uid")
  .patch(roleBasedAuthentication, (req, res, next) => {
    const updatedReview = req.body;

    Review.findOneAndUpdate({ uid: req.params.uid }, { ...updatedReview }, { new: true })
      .then((document) => {
        if (!document) {
          throw Error("Review not found.");
        }
        res.status(200).json({
          message: "Review updated",
          data: document,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(422, "Error updating review.", error.toString())));
  })
  .delete(roleBasedAuthentication, (req, res, next) => {
    Review.deleteOne({ uid: req.params.uid })
      .then((document) => {
        if (document.deletedCount === 0) {
          throw Error("Review not found.");
        }
        res.status(200).json({
          message: "Review deleted succesfully",
          data: document,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(400, "Error deleting review.", error.toString())));
  });

module.exports = router;
