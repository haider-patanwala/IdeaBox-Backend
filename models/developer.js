const mongoose = require("mongoose");
const { developerUID } = require("../utils/randomSecureKey");

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
      default: () => developerUID(),
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
    dev_organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizations", // using ref key to establish a foreign key relationship with primary key(_id) of refereced model
    },
    dev_projects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
    ],
    profile_pic: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const developerModel = mongoose.model("developers", developerSchema);

module.exports = developerModel;
