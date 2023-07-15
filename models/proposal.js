const mongoose = require("mongoose");
const { proposalUID } = require("../utils/randomSecureKey");

const proposalSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      default: () => proposalUID(),
    },
    project: {
      type: mongoose.Schema.Types.String,
      ref: "projects",
      required: true,
    },
    developer: {
      type: mongoose.Schema.Types.String,
      ref: "developers",
      required: true,
    },
  },
);

const proposalModel = mongoose.model("proposals", proposalSchema);

module.exports = proposalModel;
