const mongoose = require("mongoose");
const { randomSecureKey } = require("../utiis/randomSecureKey");

const organizationSchema = new mongoose.Schema(
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
    about: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const organizationModel = mongoose.model("organizations", organizationSchema);

module.exports = organizationModel;
