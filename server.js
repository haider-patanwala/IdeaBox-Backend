const express = require("express");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const router = require("./routes/index");
const connectToDatabase = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// initializing the express app
const app = express();

// Configurations :

// Loads .env file contents into process.env
dotenv.config();

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

// exporting server by resolving a Promise object for testing via supertest
// and then executing operatings sequentially in consecutive then blocks so that even the async operations like connectToDatabase can be executed in order.
module.exports = Promise.resolve()

  .then(() => {
    // making DB connection first before routes so that testing can happen on entries only after properly connecting to DB.
    // so resolving it first in then block and then only doing other configurations of the app.
    connectToDatabase();
  })
  .then(() => {
    // Middlwares :

    // Middlware 1 - to parse the JSON body from the request
    // without this middleware, the req.body object would be undefined
    app.use(express.json());

    // Middleware 2 - for sometimes, when we get body in urlencoded format
    // enables Express.js to automatically parse this URL-encoded data and make it available in the req.body object
    app.use(express.urlencoded({ extended: true }));

    // Middlware 3 -
    // needed this middleware because the fetch() methods on the frontend was getting error of `blocked by CORS policy`
    app.use(cors());

    // Middleware 4 -
    // it is a convenient handle file uploads in your Express app
    // It simplifies the process of accepting files sent as part of a multipart/form-data request.
    app.use(fileUpload({
      useTempFiles: true,
    }));
    // API routes :
    app.use("/developers", router.developerRouter);
    app.use("/projects", router.projectRouter);
    app.use("/organizations", router.organizationRouter);
    app.use("/reviews", router.reviewRouter);
    app.use("/proposals", router.proposalRouter);

    // Middlware 5 - A global error handler
    // do not call like ()
    // if there are syntactical erros in the req.body then even beffore the request gets process, the body error is handled over by this middleware otherwise the server get freeze due to unhandled error.... etc etc such type of unexpected errors can be handled by this middleware
    app.use(errorHandler);
  })

  .then(() => {
    // Greetings call :
    // Root path
    app.get("/", (req, res) => {
      res.send("Greetings from Project Listing App's Backend");
    });
    // RUNNING THE SERVER
    // .listen takes a port number and a callback function
    app.listen(8000, (error) => {
      if (error) {
        console.log("Server is unable to start due to error : ", error);
      } else {
        console.log("Server has started at port ----> 8000");
      }
    });
    // ************* returning app is essential. Without it the promise will have nothing to work on for testing the API.
    return app;
  })
  .catch((error) => {
    console.log("Error occured starting the server : ", error.toString());
  });
