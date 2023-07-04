const express = require("express");

// initializing the express app
const app = express();

// RUNNING THE SERVER
// .listen takes a port number and a callback function
app.listen(8000, (error) => {
  if (error) {
    console.log("Server is unable to start due to error : ", error);
  } else {
    console.log("Server has started at port ----> 8000");
  }
});
