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
    developer: {
      // would need to send "_id" value for this field as populate query in the routes function based on objectId
      type: mongoose.Schema.Types.ObjectId,
      ref: "developers",
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizations",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
  },
);

const reviewModal = mongoose.model("reviews", reviewSchema);

module.exports = reviewModal;
