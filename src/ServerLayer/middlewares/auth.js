const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const BlackListRedisClient = require("../../BusinessLayer/config/redis"); // Import the Redis client

const auth = async (req, res, next) => {
  try {
    const token = req.headers["authorization"] || "";
    if (!token) {
      return res.status(401).send("Unauthorized");
    }

    const refreshToken = req.headers["x-refresh-token"] || "";
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decodedToken) {
      return res.status(401).send("Unauthorized");
    }

    const blackListRedisClient = await BlackListRedisClient.get(token);
    if (blackListRedisClient === "true") {
      throw new Error("Access denied");
    }

    if (!decodedToken || !decodedToken.id) {
      throw new Error("Invalid token");
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).send("Unauthorized");
    }
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = auth;