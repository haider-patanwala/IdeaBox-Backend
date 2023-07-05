const express = require("express");
const Developer = require("../models/developer");

// initializing the router with express router
const router = express.Router();

router.route("/")
  .get((req, res) => res.send("Getting developers.."));

router.route("/auth/register")
  .post((req, res) => {
    const { developer } = req.body;
    console.log("req.body --->", developer);

    return Developer.create(req.body)
      .then((document) => res.status(201).json({
        message: "Developer created successfully.",
        data: document,
        errors: null,
      }))
      .catch((error) => res.status(422).json({
        message: "Error creating developer.",
        data: null,
        errors: error,
      }));
  });

module.exports = router;
