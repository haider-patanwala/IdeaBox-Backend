const express = require("express");

// initializing the router with express router
const router = express.Router();

router.route("/")
  .get((req, res) => res.send("Getting developers.."));

module.exports = router;
