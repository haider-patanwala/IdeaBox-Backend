const express = require("express");
const dotenv = require("dotenv");
const router = require("./routes/index");
const connectToDatabase = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// initializing the express app
const app = express();

// Loads .env file contents into process.env
dotenv.config();

// ---- Async function. DB connection takes time and the app gets listed first from the last line ----
connectToDatabase();

// Middlwares :

// Middlware 1 - to parse the JSON body from the request
// without this middleware, the req.body object would be undefined
app.use(express.json());

// Middleware 2 - for sometimes, when we get body in urlencoded format
// enables Express.js to automatically parse this URL-encoded data and make it available in the req.body object
app.use(express.urlencoded({ extended: true }));

// API routes :
app.use("/developers", router.developerRouter);
app.use("/projects", router.projectRouter);
app.use("/organizations", router.organizationRouter);

// Middlware 3 - A global error handler
// do not call like ()
// if there are syntactical erros in the req.body then even beffore the request gets process, the body error is handled over by this middleware otherwise the server get freeze due to unhandled error.... etc etc such type of unexpected errors can be handled by this middleware
app.use(errorHandler);

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
