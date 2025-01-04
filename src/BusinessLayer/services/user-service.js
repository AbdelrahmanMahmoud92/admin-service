const userRepository = require("../../DataLayer/repositories/user-repository");
const { ValidationError, NotExistError } = require("../errors");
const jwt = require("jsonwebtoken");
const { generateTokens } = require("./token.service");

const handleGoogleUserService = async (profile) => {
  try {
    let user = await userRepository.findUserByGoogleIdRepo(profile.id);

    if (!user) {
      const newUserData = {
        username: profile.displayName,
        googleId: profile.id,
        email: profile.emails?.[0]?.value,
      };
      user = await userRepository.signUpUserRepo(newUserData);
    }

    return user;
  } catch (error) {
    console.error("Error in Google user service:", error);
    throw error;
  }
};

const loginUser = async (email) => {
  const user = await userRepository.loginUserRepo(email);
  if (!user) {
    throw new ValidationError("User not found");
  }
  const { token, refreshToken } = generateTokens(user);

  return { token, refreshToken };
};

const retrieveAllUsers = async () => {
  const users = await userRepository.retrieveAllUsersRepo();
  return users;
};

const searchUsers = async (filters) => {
  if (!filters || typeof filters !== "object") {
    throw new ValidationError("Filters must be an object");
  }

  const users = await userRepository.searchUsersRepo(filters);
  if (users.length === 0) {
    throw new NotExistError("No users found with the provided filters");
  }

  return users;
};


const retrieveCurrentUser = async (id) => {
  const user = await userRepository.retrieveCurrentUserRepo(id);
  if (!user) {
    throw new NotExistError("User not found");
  }
  return user;
};


const disconnectGoogle = async (id) => {
  const user = await userRepository.disconnectGoogleRepo(id);
  if (!user) {
    throw new NotExistError("User not found");
  }
  return user;
}
module.exports = {
  handleGoogleUserService,
  loginUser,
  retrieveAllUsers,
  searchUsers,
  retrieveCurrentUser,
  disconnectGoogle,
};
