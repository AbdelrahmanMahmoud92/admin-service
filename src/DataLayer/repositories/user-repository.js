const User = require("../models/User");

const signUpUserRepo = async (data) => {
  try {
    return await User.create(data);
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
};

const findUserByGoogleIdRepo = async (googleId) => {
  try {
    return await User.findOne({ googleId });
  } catch (error) {
    console.error("Error finding user:", error);
    return null;
  }
};

const loginUserRepo = async (email) => {
  const user = await User.findOne({ email });

  if (!user) return null;

  return user;
};

const retrieveAllUsersRepo = async () => {
  const users = await User.find();

  return users;
};

const searchUsersRepo = async (filters) => {
  const query = {};
  if (filters.name) query.name = { $regex: filters.name, $options: "i" };

  // Searching until @
  if (filters.email) {
    const emailPrefix = filters.email.split("@")[0];
    query.email = { $regex: `^${emailPrefix}`, $options: "i" };
  }
  if (filters.googleId) query.googleId = filters.googleId;

  const users = await User.find(query);
  return users;
};

module.exports = {
  signUpUserRepo,
  findUserByGoogleIdRepo,
  loginUserRepo,
  retrieveAllUsersRepo,
  searchUsersRepo,
};
