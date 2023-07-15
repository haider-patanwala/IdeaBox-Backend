const router = require("express").Router();
const { promisify } = require("util");
const cloudinary = require("cloudinary").v2;
const Project = require("../models/project");
const ApiError = require("../utils/ApiError");
const controller = require("../controllers/project");
const { isOrganizationAuthenticated } = require("../middleware/isAuthenticated");

router.route("/")
  .get((req, res, next) => {
    // this queryObject is beneficial when some wrong query which is not intended is used in the URL
    const queryObject = {};

    // destructuring query keys from URL.
    const {
      title, techStack, board, featured, sort,
    } = req.query;

    if (title) { // FOR CASE-INSENSITIVE SEARCHING
      queryObject.title = { $regex: title, $options: "i" };
    }
    if (techStack) { // FOR CASE-INSENSITIVE SEARCHING
      queryObject.techStack = { $regex: techStack, $options: "i" };
    }
    if (board) { // FOR CASE-INSENSITIVE SEARCHING
      queryObject.board = { $regex: board, $options: "i" };
    }
    if (featured) { // FOR FILTERING
      queryObject.featured = featured;
    }
    let fetchedData = Project.find(queryObject).populate("lead").populate("proj_organization");

    if (sort) { // FOR SORTING BASE ON ANY KEY
      const fixedSort = sort.replace(",", " ");
      fetchedData = fetchedData.sort(fixedSort);
    }
    fetchedData
      .then((documents) => {
        if (documents.length === 0) {
          res.status(404).json({
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
      .catch((error) => next(new ApiError(400, "Error fetching projects.", error.toString())));
  })

  .post(isOrganizationAuthenticated, (req, res, next) => {
    const project = req.body;
    const file = req.files ? req.files.photo : null;

    try {
      if (file) {
        const cloudinaryUpload = promisify(cloudinary.uploader.upload);
        cloudinaryUpload(file.tempFilePath)
          .then((result) => {
            project.thumbnail = result.url;
            // return Project.create(project);

            controller.postProject(res, next, project, file);
          })
          .catch((error) => {
            if (error.http_code) {
              next(new ApiError(422, "Error creating project!", JSON.stringify(error)));
            } else {
              next(new ApiError(422, "Error creating project", error.toString()));
            }
          });
      } else {
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
      .catch((error) => next(new ApiError(400, "Error fetching project.", error.toString())));
  })

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
            if (error.http_code) {
              next(new ApiError(422, "Error updating project!", JSON.stringify(error)));
            } else {
              next(new ApiError(422, "Error updating project!!", error.toString()));
            }
          });
      } else {
        controller.updateProject(req, res, next, project, file);
      }
    } catch (error) {
      next(new ApiError(422, "Error updating project..", error.toString()));
    }
  })

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
      .catch((error) => next(new ApiError(400, "Error deleting project.", error.toString())));
  });

module.exports = router;
