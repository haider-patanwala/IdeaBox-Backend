const router = require("express").Router();
const { promisify } = require("util");
const cloudinary = require("cloudinary").v2;
const Project = require("../models/project");
const ApiError = require("../utils/ApiError");
const controller = require("../controllers/project");
const { isOrganizationAuthenticated } = require("../middleware/isAuthenticated");

router.route("/")
  .get((req, res, next) => {
    // Project.find()
    // Project.find({ title: "Raw" })
    // Project.find(req.query)

    // this queryObject is beneficial when some wrong query which is not intended is used in the URL
    const queryObject = {};

    // destructuring query keys from URL.
    const {
      title, techStack, board, featured, open, sort,
    } = req.query;
    // req.query helps for finding only those specific documents which are queried from the URL like /projects?title=...&board=agile

    // DEALING with case insensitive or not.
    // regex enables searching for partial values too. Like if mum is typed then Mumbai results will still come.
    if (title) { // FOR CASE-INSENSITIVE SEARCHING
      queryObject.title = { $regex: title, $options: "i" };
    }
    if (techStack) { // FOR CASE-INSENSITIVE SEARCHING
      queryObject.techStack = { $regex: techStack, $options: "i" };
    }
    if (board) { // FOR CASE-INSENSITIVE SEARCHING
      queryObject.board = { $regex: board, $options: "i" };
    }
    if (open) { // FOR FILTERING
      queryObject.open = open;
    }
    if (featured) { // FOR FILTERING
      // this is a boolean field so no need to worry about making it case insensitive as boolean always should be case sensitive.
      queryObject.featured = featured;
    }

    // had to put the find method in a variable as we needed to put sort over it again.
    // `populate` is used to fetch the foreign key referenced document in the find response based on the keys passed as an argument to the method.
    let fetchedData = Project.find(queryObject).select("title uid").populate("lead").populate("proj_organization");

    // if user has written `?sort=createdAt,updatedAt` with multiple sort conditions in URL :
    if (sort) { // FOR SORTING BASE ON ANY KEY
      const fixedSort = sort.replace(",", " ");
      // Sorting is achieved by sort("createAt updatedAt") function
      fetchedData = fetchedData.sort(fixedSort);
    }

    // if no sort then do the work as usual
    fetchedData
      .then((documents) => {
        if (documents.length === 0) {
          // returns response of empty array with 'successful request' 200 code
          res.status(200).json({
            message: "No projects data found. Insert some data please.",
            data: documents,
            errors: null,
          });
        } else {
          res.status(200).json({
            message: "Projects fetched succcessfully",
            data: documents,
            errors: null,
          });
        }
      })
      .catch((error) => next(new ApiError(422, "Error fetching projects.", error.toString())));
  })

  // isOrganizationAuthenticated is a middleware
  .post(isOrganizationAuthenticated, (req, res, next) => {
    const project = req.body;
    const file = req.files ? req.files.photo : null;

    try {
      if (file) {
        // A promise was needed to handle the errors and process the result using then blocks so promisified the cloudinary method as it is not a promise by default.
        const cloudinaryUpload = promisify(cloudinary.uploader.upload);
        cloudinaryUpload(file.tempFilePath)
          .then((result) => {
            project.thumbnail = result.url;
            // return Project.create(project);
            // shifting the common logic code to controller.
            controller.postProject(res, next, project, file);
          })
          .catch((error) => {
            // *** this if condition is for cloudinaryUpload(file.tempFilePath) promise as it returns error in object form with key `http_code` over here so handling it accordingly for that specific argument of tempFilePath
            // a typo in `tempFilePath` spelling will trigger satisfy this `if` block.
            if (error.http_code) {
              next(new ApiError(422, "Error creating project!", JSON.stringify(error)));
            } else { // this error block is for handling errors of the then block to handle any error occured before passing the execution to the controller.
              next(new ApiError(422, "Error creating project", error.toString()));
            }
          });
      } else {
        // if the file is not sent in request then do normal operations
        controller.postProject(res, next, project, file);
      }
    } catch (error) {
      next(new ApiError(422, "Error creating project..", error.toString()));
    }
  });

router.route("/:uid")

  .get((req, res, next) => {
    Project.findOne({ uid: req.params.uid })
      .then((document) => {
        if (!document) {
          throw Error("Project not found");
        }
        res.status(200).json({
          message: "Fetched project successfully.",
          data: document,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(422, "Error fetching project.", error.toString())));
  })

  // isOrganizationAuthenticated is a middleware
  .patch(isOrganizationAuthenticated, (req, res, next) => {
    const project = req.body;
    const file = req.files ? req.files.photo : null;

    try {
      if (file) {
        const cloudinaryUpload = promisify(cloudinary.uploader.upload);
        cloudinaryUpload(file.tempFilePath)
          .then((result) => {
            project.thumbnail = result.url;

            controller.updateProject(req, res, next, project, file);
          })
          .catch((error) => {
            // console.log("Error --", error);
          // this if condition is for cloudinaryUpload(file.tempFilePath) promise as it returns error in object form with key `http_code` over here so handling it accordingly for that specific argument of tempFilePath
          // a typo in `tempFilePath` spelling will trigger satisfy this `if` block.
            if (error.http_code) {
              next(new ApiError(422, "Error updating project!", JSON.stringify(error)));
            } else {
              next(new ApiError(422, "Error updating project!!", error.toString()));
            }
          });
      } else {
        // if the file is not sent in request then do normal operations
        controller.updateProject(req, res, next, project, file);
      }
    } catch (error) {
      next(new ApiError(422, "Error updating project..", error.toString()));
    }
  })

  // isOrganizationAuthenticated is a middleware
  .delete(isOrganizationAuthenticated, (req, res, next) => {
    Project.deleteOne({ uid: req.params.uid })
      .then((document) => {
        // deleteOne method doesnt return the found/deleted document
        // but it returns a key `deletedCount` with value 0 or 1
        // so if it is 0 means nothing was deleted means the documen was not found to delete.
        if (!document.deletedCount) {
          throw Error("Project not found.");
        }
        res.status(200).json({
          message: "Deleted project successfully.",
          data: document,
          errors: null,
        });
      })
      .catch((error) => next(new ApiError(422, "Error deleting project.", error.toString())));
  });

module.exports = router;
