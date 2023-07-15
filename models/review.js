const mongoose = require("mongoose");
const { reviewUID } = require("../utils/randomSecureKey");

const reviewSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      default: () => reviewUID(),
    },
    review: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    dev_uid: {
      // saving String uid as we dont need ObjectId type to be stored.
      type: mongoose.Schema.Types.String,
      ref: "developers",
    },
    org_uid: {
      type: mongoose.Schema.Types.String,
      ref: "organizations",
    },
    proj_uid: {
      type: mongoose.Schema.Types.String,
      ref: "projects",
    },
  },
);

const reviewModal = mongoose.model("reviews", reviewSchema);

module.exports = reviewModal;
