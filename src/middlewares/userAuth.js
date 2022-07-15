const jwt = require("jsonwebtoken");

module.exports = async function (req, res, next) {
  try {
    const token = req.header("Authorization") && req.header("Authorization").split(" ")[1];
    if (!token) {
      throw new Error("User not logged in");
    }
    
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
   
    req.user = decodedToken.user;
    return req.user;
  } catch (err) {
    return new Error("Authentication Failed");
  }
};
