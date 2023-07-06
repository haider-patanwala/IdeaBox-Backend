const mongoose = require("mongoose");
const { randomSecureKey } = require("../utiis/randomSecureKey");

const developerSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      // default is given a callback
      // since for every instance, a new uid needs to be generated from this model schema
      // without callback, there would be error of
      // `"MongoServerError: E11000 duplicate key error collection`
      // for continous creation of document with same body.
      default: () => randomSecureKey(),
    },
    fname: {
      type: String,
      required: true,
    },
    lname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    qualification: {
      type: String,
    },
    skills: {
      type: String,
    },
    city: {
      type: String,
    },
    openToWork: {
      type: Boolean,
    },
    linkedin: {
      type: String,
    },
    github: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const developerModel = mongoose.model("developers", developerSchema);

module.exports = developerModel;
