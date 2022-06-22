// use this middleware for routes which require authorization
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    const error = new Error("Not Authorization");
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(" ")[1]; // get header value

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, "someSuperSecretString"); // verify() is a jsonwebtoken method, dont forget to provide secret
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  // we will use this id in controllers
  req.userId = decodedToken.userId; // we have user id since we decoded token which contained the id
  next();
};
