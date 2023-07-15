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
      // would need to send "_id" value for this field as populate query in the routes function based on objectId
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
      required: true,
    },
    developer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "developers",
      required: true,
    },
  },
);

const proposalModel = mongoose.model("proposals", proposalSchema);

module.exports = proposalModel;
