const router = require("express").Router();
const { roleBasedAuthentication } = require("../middleware/isAuthenticated");
const Review = require("../models/review");
const ApiError = require("../utils/ApiError");

router.route("/")
  .get((req, res, next) => {
    // this queryObject is beneficial when some wrong query which is not intended is used in the URL
    const queryObject = {};

    // destructuring query key from URL.
    const { sort } = req.query;

    // populating specific collections with only selected properties. - means to neglect that field i.e. _id
    let fetchedData = Review.find(queryObject).populate({ path: "developer", select: "fname lname email uid -_id" }).populate({ path: "organization", select: "name website uid -_id" }).populate({ path: "project", select: "title uid -_id" });

    // if user has written `?sort=fname,city` with multiple sort conditions in URL :
    if (sort) {
      const sortFixed = sort.replace(",", " ");
      fetchedData = fetchedData.sort(sortFixed);
    }

    fetchedData
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
