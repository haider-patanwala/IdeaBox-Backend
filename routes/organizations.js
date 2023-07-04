const router = require("express").Router();

router.route("/")
  .get((req, res) => {
    res.send("Getting organizations..");
  });

module.exports = router;
