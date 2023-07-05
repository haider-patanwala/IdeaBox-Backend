const mongoose = require("mongoose");
const { randomSecureKey } = require("../utiis/randomSecureKey");

const developerSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      default: randomSecureKey(),
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    contact: {
      type: Number,
      required: true,
    },
    qualification: {
      type: String,
    },
    skills: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const developerModel = mongoose.model("developers", developerSchema);

module.exports = developerModel;
