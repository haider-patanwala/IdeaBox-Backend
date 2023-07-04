const mongoose = require("mongoose");

module.exports = () => {
  // connect method takes 2 arguments - URL string & options
  mongoose.connect(process.env.MONGO_URI, {})
    .then((client) => {
      const { db } = client.connection;
      console.log("Database connection established ! Database name : ", db.databaseName);
    })
    .catch((error) => {
      console.log("Failed connecting to database. Error : ", error);

      // to race shutdown the server programmatically with success response to systematically shut down the event loop of nodejs
      process.exit(0);
    });
};
