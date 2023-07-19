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
    // sending multiple references in an array for onne to many relation kinda thing.
    org_projects: [{
      // would need to send "_id" value for this field as populate query in the routes function based on objectId
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    }],
    banner_img: {
      type: "String",
      default: "https://res.cloudinary.com/dulptytgu/image/upload/v1689547610/vdgzaagklqgqjpnzlyyl.jpg",
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

// mongoose.model takes 2 arguments
// 1st - Name of the collection
// 2nd - Name of the schema
const organizationModel = mongoose.model("organizations", organizationSchema);

module.exports = organizationModel;
