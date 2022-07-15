var cloudinary = require("cloudinary").v2;
module.exports.uploadToCloudinary = (fileBase64) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(fileBase64, (err, result) => {
      if (err) {
        console.log(`cloudinary upload error: ${err}`);
        return reject(err);
      }
      else {
        return resolve(result);
      }
    });
  });
}
