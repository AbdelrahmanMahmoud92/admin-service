const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const userService = require("../../BusinessLayer/services/user-service");
const userRepository = require("../../DataLayer/repositories/user-repository");
const BlackListRedisClient = require("../../BusinessLayer/config/redis"); // Import the Redis client
const passport = require("passport");

const loginUserController = asyncHandler(async (req, res) => {
  /*
  Since Google ensures the user is authenticated,
  your app doesn't need to verify their credentials (like a password).
  Instead, you trust Google's authentication process.
  */
  const { email } = req.body;

  await userRepository.loginUserRepo(email);
  const { token, refreshToken } = await userService.loginUser(email);

  res.status(200).json({
    message: "User logged in successfully",
    token,
    refreshToken,
  });
});

const logoutUserController = asyncHandler(async (req, res) => {
  const token = req.headers["authorization"];
  const refreshToken = req.headers["x-refresh-token"];
  if (!token || !refreshToken) {
    return res
      .status(400)
      .json({ message: "Token and Refresh Token are required" });
  }

  const tokenPayload = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const refreshTokenPayload = jwt.verify(
    refreshToken,
    process.env.REFRESH_SECRET_KEY
  );

  if (tokenPayload.id !== refreshTokenPayload.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const tokenLife = tokenPayload.exp - Math.floor(Date.now() / 1000);
  const refreshTokenLife =
    refreshTokenPayload.exp - Math.floor(Date.now() / 1000);

  await Promise.all([
    BlackListRedisClient.setEx(token, tokenLife, "true"),
    BlackListRedisClient.setEx(refreshToken, refreshTokenLife, "true"),
  ]);

  res.status(200).json({ message: "User logged out successfully" });

  if (error.name === "TokenExpiredError") {
    await Promise.all([
      BlackListRedisClient.set(token, "true"),
      BlackListRedisClient.set(refreshToken, "true"),
    ]);

    return res
      .status(200)
      .json({ message: "User logged out successfully (Tokens were expired)" });
  }

  return res.status(401).json({ message: "Invalid Token or Refresh Token" });
});

const retrieveAllUsersController = asyncHandler(async (req, res) => {
  const admin = req.user;
  if (!admin) {
    return res.status(401).send("You're not allowed to make this request");
  }

  const users = await userService.retrieveAllUsers();

  res.status(200).json({
    message: "Users retrieved successfully",
    data: users,
  });
});

const searchUsersController = asyncHandler(async (req, res) => {
  const filters = req.query;
  const admin = req.user;
  if (!admin) {
    return res.status(401).send("You're not allowed to make this request");
  }

  let filterMessage = Object.entries(filters)
    .map(([key, value]) => {
      return `${value} ${key}`;
    })
    .join(", ");

  const users = await userService.searchUsers(filters);
  res.status(200).json({
    message: `Users with ${filterMessage} retrieved successfully`,
    data: users,
  });
});
module.exports = {
  loginUserController,
  retrieveAllUsersController,
  searchUsersController,
  logoutUserController,
};
