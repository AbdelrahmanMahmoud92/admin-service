const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const generateTokens = (user) => {
  const jwtUser = {
    id: user.id,
    email: user.email,
    googleId: user.googleId,
    username: user.username,
  };

  const token = jwt.sign(jwtUser, process.env.JWT_SECRET_KEY, {
    expiresIn: "24h", // صلاحية الـ Token (24 ساعة)
  });

  const refreshToken = jwt.sign(jwtUser, process.env.REFRESH_SECRET_KEY, {
    expiresIn: "7d", // صلاحية الـ Refresh Token (7 أيام)
  });

  return { token, refreshToken };
};

module.exports = { generateTokens };