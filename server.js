const express = require("express");
const dotenv = require("dotenv");
const connectToDatabase = require("./config/db");

// initializing the express app
const app = express();

// Loads .env file contents into process.env
dotenv.config();

// ---- Async function. DB connection takes time and the app gets listed first from the last line ----
connectToDatabase();

// RUNNING THE SERVER
// .listen takes a port number and a callback function
app.listen(8000, (error) => {
  if (error) {
    console.log("Server is unable to start due to error : ", error);
  } else {
    console.log("Server has started at port ----> 8000");
  }
});
