const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
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
