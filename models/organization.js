const mongoose = require("mongoose");
const { organizationUID } = require("../utils/randomSecureKey");

const organizationSchema = new mongoose.Schema(
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
      default: () => organizationUID(),
    },
    name: {
      type: String,
      required: true,
    },
    about: {
      type: String,
    },
    website: {
      type: String,
    },
    domain: {
      type: String,
    },
    org_projects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
    ],
    banner_img: {
      type: "String",
    },
    password: {
      type: "String",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const organizationModel = mongoose.model("organizations", organizationSchema);

module.exports = organizationModel;
