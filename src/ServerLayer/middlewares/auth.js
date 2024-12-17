const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const auth = (req, res, next) => {
  try {
    const token = req.headers["authorization"];
    console.log(token);
    if (!token) {
      return res.status(401).send("Unauthorized");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decodedToken) {
      return res.status(401).send("Unauthorized");
    }

    console.log("decodedToken: ", decodedToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send("Unauthorized");
  }
};

module.exports = auth;
