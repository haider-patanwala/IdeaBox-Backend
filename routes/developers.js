const router = require("express").Router();
const { promisify } = require("util");
const cloudinary = require("cloudinary").v2;
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Developer = require("../models/developer");
const ApiError = require("../utils/ApiError");
const controller = require("../controllers/developer");
require('dotenv').config();

const rounds = process.env.SALT_ROUNDS;
const secret = process.env.JWT_SECRET;

router.route("/")
  .get((req, res, next) => {
    // `populate` is used to fetch the foreign key referenced document in the find response based on the keys passed as an argument to the method.
    Developer.find().populate("dev_organization").populate("dev_projects")
      .then((documents) => {
        res.status(200).json({
          message: "Developers fetched successfully",
          data: documents,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(400, "Error fetching developers.", error.toString())));
  });

router.route("/auth/register")
  .post(body("password").isLength({ min: 8, max: 16 }), async (req, res, next) => {
    const developer = req.body;
    const { password } = req.body;
    const file = req.files ? req.files.photo : null;
    const errors = validationResult(req);

    if (!password) {
      const { msg, path } = errors.array()[0];
      return next(new ApiError(400, "Developer registration failed. Please provide a password.", `${path} : ${msg}`));
    }
    if (!errors.isEmpty()) {
      const { msg, path } = errors.array()[0];
      return next(new ApiError(400, "Developer registration failed. Provide password with min 8, max 16 characters. ", `${path} : ${msg}`));
    }
    try {
      const salt = await bcrypt.genSalt(parseInt(rounds, 10));
      const securedPassword = await bcrypt.hash(req.body.password, salt);

      const securedDeveloper = { ...developer, password: securedPassword };

      if (file) {
        const cloudinaryUpload = promisify(cloudinary.uploader.upload);
        return cloudinaryUpload(file.tempFilePath)
          .then((result) => {
            securedDeveloper.profile_pic = result.url;
            // return Developer.create(developer);
            controller.registerDeveloper(res, next, securedDeveloper, file);
          })
          .catch((error) => {
            // console.log("Error --", error);
            // *** this if condition is for cloudinaryUpload(file.tempFilePath) promise as it returns error in object form with key `http_code` over here so handling it accordingly for that specific argument of tempFilePath
            // a typo in `tempFilePath` spelling will trigger satisfy this `if` block.
            if (error.http_code) {
              next(new ApiError(422, "Error creating developer!!", JSON.stringify(error)));
            } else { // this error block is for handling errors of the then block to handle any error occured before passing the execution to the controller.
              next(new ApiError(422, "Error creating developer!", error.toString()));
            }
          });
      }
      return controller.registerDeveloper(res, next, securedDeveloper, file);
    } catch (error) {
      return next(new ApiError(422, "Error creating developer..", error.toString()));
    }
  });

router.route("/auth/login")
  .post((req, res, next) => {
    const { email, password } = req.body;
    Developer.findOne({ email: req.body.email })
      .then(async (document) => {
        if (!document) {
          throw Error("Developer doesn't exist.");
        }
        // this compare function returns a boolean value here.
        const passwordCompare = await bcrypt.compare(password, document.password);
        if (!passwordCompare) {
          throw Error("Incorrect Password.");
        }

        const token = jwt.sign({ email }, secret);
        console.log("token - ", token);
        res.status(200).json({
          message: "Developer login successfull.",
          data: {
            access_token: token,
            developer: document,
          },
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(422, "Error logging in Developer.", error.toString())));
  });
router.route("/:uid")
  .get((req, res, next) => {
    Developer.findOne({ uid: req.params.uid }).populate("dev_organization").populate("dev_projects")
      .then((document) => {
        if (!document) {
          throw Error("Developer not found");
        }
        res.status(200).json({
          message: "Developer fetched successfully.",
          data: document,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(400, "Error fetching developer.", error.toString())));
  })

  .patch((req, res, next) => {
    const developer = req.body;

    // respone bydefault comes an old document so giving new:true option to get a fresh updated document.
    Developer.findOneAndUpdate({ uid: req.params.uid }, { ...developer }, { new: true })
      .then((document) => {
        if (!document) {
          throw Error("Developer not found.");
        }

        return res.status(200).json({
          message: "Developer Updated",
          data: document,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(422, "Error updating developer.", error.toString())));
  })

  .delete((req, res, next) => {
    Developer.deleteOne({ uid: req.params.uid })
      .then((document) => {
        // deleteOne method doesnt return the found/deleted document
        // but it returns a key `deletedCount` with value 0 or 1
        // so if it is 0 means nothing was deleted means the documen was not found to delete.
        if (document.deletedCount === 0) {
          throw Error("Developer not found.");
        }
        return res.status(200).json({
          message: "Developer deleted successfully.",
          data: document,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(400, "Error deleting developer.", error.toString())));
  });
module.exports = router;
