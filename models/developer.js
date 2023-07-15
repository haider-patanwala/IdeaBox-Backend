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
    password: {
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
    skills: [{
      type: String,
    }],
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
      // would need to send "_id" value for this field as populate query in the routes function based on objectId
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizations", // using ref key to establish a foreign key relationship with primary key(_id) of refereced model
    },
    // sending multiple references in an array for onne to many relation kinda thing.
    dev_projects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
    ],
    profile_pic: {
      type: String,
    },
    technical_role: { // like engineer/researcher/designer.....
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// mongoose.model takes 2 arguments
// 1st - Name of the collection
// 2nd - Name of the schema
const developerModel = mongoose.model("developers", developerSchema);

module.exports = developerModel;
