const fs = require("fs");

module.exports.deleteTmp = (file) => {
  // Clean up the temporary file
  // this unlinking prevents each temp file from getting saved into the `tmp`folder.
  fs.unlink(file.tempFilePath, (err) => {
    if (err) {
      console.error(`Error deleting file: ${file.tempFilePath}`, err);
    }
  });

  // Deleting the empty tmp folder now
  const tmpFolderPath = "./tmp";
  fs.rm(tmpFolderPath, { recursive: true }, (err) => {
    if (err) {
      console.error('Error deleting tmp folder:', err);
    } else {
      console.log('Tmp folder has been deleted successfully.');
    }
  });
};
