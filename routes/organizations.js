const router = require("express").Router();
const cloudinary = require("cloudinary").v2;
const { promisify } = require("util");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Organization = require("../models/organization");
const ApiError = require("../utils/ApiError");
const controller = require("../controllers/organization");
const { isOrganizationAuthenticated } = require("../middleware/isAuthenticated");
require("dotenv").config();

const rounds = process.env.SALT_ROUNDS;
const secret = process.env.JWT_SECRET;

router.route("/")
  .get((req, res, next) => {
    // Organization.find()
    // Organization.find({ name: "Raw Enginnering India Pvt Ltd"})
    // Organization.find(req.query)

    // this queryObject is beneficial when some wrong query which is not intended is used in the URL
    const queryObject = {};

    // destructuring query keys from URL.
    const {
      _id, name, domain, sort,
    } = req.query;
    // req.query helps for finding only those specific documents which are queried from the URL like /organizations?name=raw&domain=IT

    if (_id) { // FOR SEARCHING
      queryObject._id = _id;
    }
    if (name) { // FOR CASE-INSENSITIVE SEARCHING
      queryObject.name = { $regex: name, $options: "i" };
    }
    if (domain) { // FOR CASE-INSENSITIVE SEARCHING
      queryObject.domain = { $regex: domain, $options: "i" };
    }

    // had to put the find method in a variable as we needed to put sort over it again.
    // `populate` is used to fetch the foreign key referenced document in the find response based on the keys passed as an argument to the method.
    let fetchedData = Organization.find(queryObject).select("-password").populate("org_projects", "title uid");

    // if user has written `?sort=name,domain` with multiple sort conditions in URL :
    if (sort) { // FOR SORTING BASED ON ANY KEY
      const fixedSort = sort.replace(",", " ");
      // Sorting is achieved by sort("name") function
      fetchedData = fetchedData.sort(fixedSort);
    }

    // if no sort then do the work as usual
    fetchedData
      .then((documents) => {
        if (documents.length === 0) {
          // returns response of empty array with 'successful request' 200 code
          res.status(200).json({
            message: "No organizations data found. Insert some data please.",
            data: documents,
            errors: null,
          });
        } else {
          res.status(200).json({
            message: "Fetched organization successfully.",
            data: documents,
            errors: null,
          });
        }
      })
      .catch((error) => next(new ApiError(422, "Error fetching organizations.", error.toString())));
  });

router.route("/auth/register")

  // body() is an express-validator middleware
  .post(body("password").isLength({ min: 8, max: 16 }).withMessage("Password should be atleast 8 and maximum 16 characters"), async (req, res, next) => {
    const organization = req.body;
    const { password } = req.body;
    const file = req.files ? req.files.photo : null;
    const errors = validationResult(req);

    if (!password) {
      const { msg, path } = errors.array()[0];
      // 400 HTTP status code because the error would be related to invalid request payload and this is a severe error!
      return next(new ApiError(400, "Organization registration failed. Please provide a password.", `${path} : ${msg}`));
    }

    // if express-validator throws errors of req.body
    if (!errors.isEmpty()) {
      const { msg, path } = errors.array()[0];
      return next(new ApiError(400, "Organization registration failed. Please check your inputs.", `${path} : ${msg}`));
    }
    try {
      const salt = await bcrypt.genSalt(parseInt(rounds, 10));
      const securedPassword = await bcrypt.hash(password, salt);

      const securedOrganization = { ...organization, password: securedPassword };
      if (file) {
        // A promise was needed to handle the errors and process the result using then blocks so promisified the cloudinary method as it is not a promise by default.
        const cloudinaryUpload = promisify(cloudinary.uploader.upload);
        return cloudinaryUpload(file.tempFilePath)
          .then((result) => {
            securedOrganization.banner_img = result.url;
            // return Organization.create(organization);
            // shifting the common logic code to controller.
            controller.postOrganization(res, next, securedOrganization, file);
          })
          .catch((error) => {
          // *** this if condition is for cloudinaryUpload(file.tempFilePath) promise as it returns error in object form with key `http_code` over here so handling it accordingly for that specific argument of tempFilePath
          // a typo in `tempFilePath` spelling will trigger satisfy this `if` block.
            if (error.http_code) {
              next(new ApiError(422, "Error creating organization!", JSON.stringify(error)));
            } else { // this error block is for handling errors of the then block to handle any error occured before passing the execution to the controller.
              next(new ApiError(422, "Error creating organization!!", error.toString()));
            }
          });
      }
      // if the file is not sent in request then do normal operations
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
        // this compare function returns a boolean value here.
        const passwordCompare = await bcrypt.compare(password, document.password);
        if (!passwordCompare) {
          throw Error("Incorrect Password.");
        }

        // sign with { uid } only so that the key can be later on checked by the roleBasedAuthentication middleware.
        const token = jwt.sign({ uid }, secret);

        res.status(200).json({
          message: "Organization logged in successfully.",
          data: {
            access_token: token,
            organization: document,
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
    Organization.findOne({ uid: req.params.uid }).select("-password").populate("org_projects", "title uid")
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
      .catch((error) => next(new ApiError(422, "Error fetching organization.", error.toString())));
  })

  // isOrganizationAuthenticated is a middleware
  .patch(isOrganizationAuthenticated, (req, res, next) => {
    const organization = req.body;
    const file = req.files ? req.files.photo : null;

    try {
      if (file) {
        const cloudinaryUpload = promisify(cloudinary.uploader.upload);
        cloudinaryUpload(file.tempFilePath)
          .then((result) => {
            organization.banner_img = result.url;

            controller.updateOrganiztion(req, res, next, organization, file);
          })
          .catch((error) => {
            // console.log("Error --", error);
          // this if condition is for cloudinaryUpload(file.tempFilePath) promise as it returns error in object form with key `http_code` over here so handling it accordingly for that specific argument of tempFilePath
          // a typo in `tempFilePath` spelling will trigger satisfy this `if` block.
            if (error.http_code) {
              next(new ApiError(422, "Error updating organization!", JSON.stringify(error)));
            } else {
              next(new ApiError(422, "Error updating organization!!", error.toString()));
            }
          });
      } else {
        // if the file is not sent in request then do normal operations
        controller.updateOrganiztion(req, res, next, organization, file);
      }
    } catch (error) {
      next(new ApiError(422, "Error updating organization..", error.toString()));
    }
  })

  // isOrganizationAuthenticated is a middleware
  .delete(isOrganizationAuthenticated, (req, res, next) => {
    Organization.deleteOne({ uid: req.params.uid })
      .then((document) => {
        // deleteOne method doesnt return the found/deleted document
        // but it returns a key `deletedCount` with value 0 or 1
        // so if it is 0 means nothing was deleted means the documen was not found to delete.
        if (document.deletedCount === 0) {
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
