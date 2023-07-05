const mongoose = require("mongoose");

const developerSchema = new mongoose.Schema(
  {
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
