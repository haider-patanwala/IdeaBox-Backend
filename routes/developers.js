const router = require("express").Router();
const { promisify } = require("util");
const cloudinary = require("cloudinary").v2;
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Developer = require("../models/developer");
const ApiError = require("../utils/ApiError");
const controller = require("../controllers/developer");
const { isDeveloperAuthenticated } = require("../middleware/isAuthenticated");
require('dotenv').config();

const rounds = process.env.SALT_ROUNDS;
const secret = process.env.JWT_SECRET;

router.route("/")
  .get((req, res, next) => {
    // Developer.find()
    // Developer.find({ fname: "Meet" })
    // Developer.find(req.query)

    // this queryObject is beneficial when some wrong query which is not intended is used in the URL
    const queryObject = {};

    // destructuring these queries from URL.
    // they'll be passes like this --> `?city=mumbai` or `?openToWork=true` or `?sort=fname,city`
    // so destructuring just the keys.
    const {
      _id, openToWork, city, sort, fname, lname, qualification,
    } = req.query;
    // req.query helps for finding only those specific documents which are queried from the URL like /developers?fname=Meet&fname=Tarun

    // DEALING with case insensitive or not.
    // regex enables searching for partial values too. Like if mum is typed then Mumbai results will still come.
    if (city) { // FOR CASE-INSENSITIVE SEARCHING
      // queryObject.city = city;
      queryObject.city = { $regex: city, $options: "i" }; // i option means case insensitive.
    }
    if (fname) { // FOR CASE-INSENSITIVE SEARCHING
      queryObject.fname = { $regex: `${fname}`, $options: "i" };
    }
    if (lname) { // FOR CASE-INSENSITIVE SEARCHING
      queryObject.lname = { $regex: lname, $options: "i" };
    }
    if (qualification) { // FOR CASE-INSENSITIVE SEARCHING
      queryObject.qualification = { $regex: qualification, $options: "i" };
    }
    if (_id) { // FOR SEARCHING
      queryObject._id = _id;
    }
    if (openToWork) { // FOR FILTERING
      // this is a boolean field so no need to worry about making it case insensitive as boolean always should be case sensitive.
      queryObject.openToWork = openToWork;
    }

    // had to put the find method in a variable as we needed to put sort over it again.
    // `populate` is used to fetch the foreign key referenced document in the find response based on the keys passed as an argument to the method.
    // sending only the selected fields in the 2nd arg of populate()
    let fetchedData = Developer.find(queryObject).select("-password").populate("dev_organization", "name uid").populate("dev_projects");

    // if user has written `?sort=fname,city` with multiple sort conditions in URL :
    if (sort) { // FOR SORTING BASE ON ANY KEY
      const sortFixed = sort.replace(",", " ");
      // Sorting is achieved by sort("fname -city") function
      fetchedData = fetchedData.sort(sortFixed);
    }

    // if no sort then do the work as usual
    fetchedData
      .then((documents) => {
        if (documents.length === 0) {
          // returns response of empty array with 'successful request' 200 code
          res.status(200).json({
            message: "No developers data found. Insert some data please.",
            data: documents,
            errors: null,
          });
        } else {
          // eslint-disable-next-line no-unused-vars
          const headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST,PATCH,OPTIONS',
          };
          res.status(200).json({
            // headers,
            message: "Developers fetched successfully",
            data: documents,
            errors: null,
          });
        }
      })
      .catch((error) => next(new ApiError(422, "Error fetching developers.", error.toString())));
  });

router.route("/auth/register")

  // body() is an express-validator middleware
  .post(body("email").isEmail().withMessage("Enter a valid email"), body("password").isLength({ min: 8, max: 16 }).withMessage("Password should be atleast 8 and maximum 16 characters"), async (req, res, next) => {
    const developer = req.body;
    const { password } = req.body;
    const file = req.files ? req.files.photo : null;
    const errors = validationResult(req);

    if (!password) {
      const { msg, path } = errors.array()[0];
      // 400 HTTP status code because the error would be related to invalid request payload and this is a severe error!
      return next(new ApiError(400, "Developer registration failed. Please provide a password.", `${path} : ${msg}`));
    }

    // if express-validator throws errors of req.body
    if (!errors.isEmpty()) {
      const { msg, path } = errors.array()[0];
      return next(new ApiError(400, "Developer registration failed. Please check your inputs.", `${path} : ${msg}`));
    }
    try {
      const salt = await bcrypt.genSalt(parseInt(rounds, 10));
      const securedPassword = await bcrypt.hash(req.body.password, salt);

      const securedDeveloper = { ...developer, password: securedPassword };

      if (file) {
        // A promise was needed to handle the errors and process the result using then blocks so promisified the cloudinary method as it is not a promise by default.
        const cloudinaryUpload = promisify(cloudinary.uploader.upload);
        return cloudinaryUpload(file.tempFilePath)
          .then((result) => {
            securedDeveloper.profile_pic = result.url;
            // return Developer.create(developer);
            // shifting the common logic code to controller.
            controller.registerDeveloper(res, next, securedDeveloper, file);
          })
          .catch((error) => {
            // *** this if condition is for cloudinaryUpload(file.tempFilePath) promise as it returns error in object form with key `http_code` over here so handling it accordingly for that specific argument of tempFilePath
            // a typo in `tempFilePath` spelling will trigger satisfy this `if` block.
            if (error.http_code) {
              next(new ApiError(422, "Error creating developer!!", JSON.stringify(error)));
            } else { // this error block is for handling errors of the then block to handle any error occured before passing the execution to the controller.
              next(new ApiError(422, "Error creating developer!", error.toString()));
            }
          });
      }
      // if the file is not sent in request then do normal operations
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
          throw Error("Developer not found.");
        }
        // this compare function returns a boolean value here.
        const passwordCompare = await bcrypt.compare(password, document.password);
        if (!passwordCompare) {
          throw Error("Incorrect Password.");
        }

        // sign with { email } only so that the key can be later on checked by the roleBasedAuthentication middleware.
        const token = jwt.sign({ email }, secret);

        res.status(200).json({
          message: "Developer login successful.",
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
    Developer.findOne({ uid: req.params.uid }).select("-password").populate("dev_organization").populate("dev_projects")
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
      .catch((error) => next(new ApiError(422, "Error fetching developer.", error.toString())));
  })

  // isDeveloperAuthenticated is a middleware
  .patch(isDeveloperAuthenticated, (req, res, next) => {
    const developer = req.body;
    const file = req.files ? req.files.photo : null;

    try {
      if (file) {
        const cloudinaryUpload = promisify(cloudinary.uploader.upload);
        cloudinaryUpload(file.tempFilePath)
          .then((result) => {
            developer.profile_pic = result.url;

            controller.updateDeveloper(req, res, next, developer, file);
          })
          .catch((error) => {
            // console.log("Error --", error);
          // this if condition is for cloudinaryUpload(file.tempFilePath) promise as it returns error in object form with key `http_code` over here so handling it accordingly for that specific argument of tempFilePath
          // a typo in `tempFilePath` spelling will trigger satisfy this `if` block.
            if (error.http_code) {
              next(new ApiError(422, "Error updating developer!", JSON.stringify(error)));
            } else {
              next(new ApiError(422, "Error updating developer!!", error.toString()));
            }
          });
      } else {
        // if the file is not sent in request then do normal operations
        controller.updateDeveloper(req, res, next, developer, file);
      }
    } catch (error) {
      next(new ApiError(422, "Error updating developer..", error.toString()));
    }
  })

  // isDeveloperAuthenticated is a middleware
  .delete(isDeveloperAuthenticated, (req, res, next) => {
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
      .catch((error) => next(new ApiError(422, "Error deleting developer.", error.toString())));
  });
module.exports = router;
