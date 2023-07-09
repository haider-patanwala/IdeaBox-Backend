const router = require("express").Router();
const cloudinary = require("cloudinary").v2;
const { promisify } = require("util");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Organization = require("../models/organization");
const ApiError = require("../utils/ApiError");
const controller = require("../controllers/organization");
require("dotenv").config();

const rounds = process.env.SALT_ROUNDS;
const secret = process.env.JWT_SECRET;

router.route("/")
  .get((req, res, next) => {
    Organization.find().populate("org_projects")
      .then((documents) => {
        res.status(200).json({
          message: "Fetched organization successfully.",
          data: documents,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(400, "Error fetching organizations.", error.toString())));
  });

router.route("/auth/register")
  .post(body("password").isLength({ min: 8, max: 16 }), async (req, res, next) => {
    const organization = req.body;
    const { password } = req.body;
    const file = req.files ? req.files.photo : null;
    const errors = validationResult(req);

    if (!password) {
      const { msg, path } = errors.array()[0];
      return next(new ApiError(400, "Organization registration failed. Please provide a password.", `${path} : ${msg}`));
    }
    if (!errors.isEmpty()) {
      const { msg, path } = errors.array()[0];
      return next(new ApiError(400, "Organization registration failed. Provide password with min 8, max 16 characters. ", `${path} : ${msg}`));
    }
    try {
      const salt = await bcrypt.genSalt(parseInt(rounds, 10));
      const securedPassword = await bcrypt.hash(password, salt);

      const securedOrganization = { ...organization, password: securedPassword };
      if (file) {
        const cloudinaryUpload = promisify(cloudinary.uploader.upload);
        return cloudinaryUpload(file.tempFilePath)
          .then((result) => {
            securedOrganization.banner_img = result.url;
            // return Organization.create(organization);
            controller.postOrganization(res, next, securedOrganization, file);
          })
          .catch((error) => {
          // console.log("Error --", error);
          // this if condition is for cloudinaryUpload(file.tempFilePath) promise as it returns error in object form with key `http_code` over here so handling it accordingly for that specific argument of tempFilePath
          // a typo in `tempFilePath` spelling will trigger satisfy this `if` block.
            if (error.http_code) {
              next(new ApiError(422, "Error creating organization!", JSON.stringify(error)));
            } else {
              next(new ApiError(422, "Error creating organization!!", error.toString()));
            }
          });
      }
      return controller.postOrganization(res, next, securedOrganization, file);
    } catch (error) {
      return next(new ApiError(422, "Error creating organization..", error.toString()));
    }
  });

router.route("/auth/login")
  .post((req, res, next) => {
    const { uid, password } = req.body;
    Organization.findOne({ uid: req.body.uid })
      .then(async (document) => {
        if (!document) {
          throw Error("Organization not found.");
        }
        const passwordCompare = await bcrypt.compare(password, document.password);
        if (!passwordCompare) {
          throw Error("Incorrect Password.");
        }

        const token = jwt.sign({ uid }, secret);
        res.status(200).json({
          message: "Organization logged in successfully.",
          data: {
            access_token: token,
            developer: document,
          },
          errors: null,
        });
      })
      .catch((error) => {
        next(new ApiError(422, "Error logging in Organization.", error.toString()));
      });
  });

router.route("/:uid")
  .get((req, res, next) => {
    Organization.findOne({ uid: req.params.uid }).populate("org_projects")
      .then((document) => {
        if (!document) {
          throw Error("Organization not found.");
        }
        res.status(200).json({
          message: "Fetched organization successfully",
          data: document,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(400, "Error fetching organization.", error.toString())));
  })

  .patch((req, res, next) => {
    const organization = req.body;

    // respone bydefault comes an old document so giving new:true option to get a fresh updated document.
    Organization.findOneAndUpdate({ uid: req.params.uid }, { ...organization }, { new: true })
      .then((document) => {
        if (!document) {
          throw Error("Organization not found.");
        }
        return res.status(200).json({
          message: "Updated organization successfully.",
          data: document,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(422, "Error updating organization.", error.toString())));
  })
  .delete((req, res, next) => {
    Organization.findOneAndDelete({ uid: req.params.uid })
      .then((document) => {
        // deleteOne method doesnt return the found/deleted document
        // but it returns a key `deletedCount` with value 0 or 1
        // so if it is 0 means nothing was deleted means the documen was not found to delete.
        if (!document.deletedCount) {
          throw Error("Organization not found");
        }
        return res.status(200).json({
          message: "Deleted organization successfully.",
          data: document,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(400, "Error deleting organization.", error.toString())));
  });

module.exports = router;
