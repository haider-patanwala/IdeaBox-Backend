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
    // req.query helps for finding only those specific documents which are queried from the URL like /reviews?sort=createdAt

    // had to put the find method in a variable as we needed to put sort over it again.
    // `populate` is used to fetch the foreign key referenced document in the find response based on the keys passed as an argument to the method.
    // populating specific collections with only selected properties. - means to neglect that field i.e. _id
    let fetchedData = Review.find(queryObject).populate({ path: "developer", select: "fname lname email uid -_id" }).populate({ path: "organization", select: "name website uid -_id" }).populate({ path: "project", select: "title uid -_id" });

    // if user has written `?sort=createdAt,updatedAt` with multiple sort conditions in URL :
    if (sort) {
      const sortFixed = sort.replace(",", " ");
      // Sorting is achieved by sort("createdAt,updatedAt") function
      fetchedData = fetchedData.sort(sortFixed);
    }

    // if no sort then do the work as usual
    fetchedData
      .then((documents) => {
        if (documents.length === 0) {
          // returns response of empty array with 'successful request' 200 code
          res.status(200).json({
            message: "No reviews data found. Insert some data please.",
            data: documents,
            errors: null,
          });
        } else {
          res.status(200).json({
            message: "Fetched reviews succesfully.",
            data: documents,
            errors: null,
          });
        }
      })
      .catch((error) => next(new ApiError(422, "Error fetching reviews.", error.toString())));
  })

  // roleBasedAuthentication is a middlware powered by other 2 middlwares to conditionally verfy the authToken.
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

  // roleBasedAuthentication is middlware powered by other 2 middlwares to conditionally verfy the authToken.
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

  // roleBasedAuthentication is middlware powered by other 2 middlwares to conditionally verfy the authToken.
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
      .catch((error) => next(new ApiError(422, "Error deleting review.", error.toString())));
  });

module.exports = router;
