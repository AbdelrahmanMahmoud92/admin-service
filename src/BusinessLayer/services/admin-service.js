const validator = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const adminRepository = require("../../DataLayer/repositories/admin-repository");
const { ADMIN_STATUS } = require("../../BusinessLayer/enums/admin-status");
const {
  ValidationError,
  NotExistError,
  InvalidStatusError,
} = require("../errors/index");
const { ADMIN_ROLES } = require("../enums/admin-roles");
const sendInvaiteEmail = require("../utils/sendEmail");

const validateId = async (id) => {
  if (!validator.isUUID(id)) {
    throw new ValidationError("Invalid admin ID, it must be UUID");
  }
};

const validateName = async (name) => {
  if (
    !validator.isLength(name, { min: 2, max: 50 }) ||
    typeof name !== "string"
  ) {
    throw new ValidationError("Admin name must be between 2 and 50 characters");
  }
};

const validateStatus = async (status) => {
  if (!Object.values(ADMIN_STATUS).includes(status)) {
    throw new InvalidStatusError("Invalid admin status");
  }
};

const createSuperAdmin = async (name, email, password) => {
  await validateName(name);

  const hashedPassword = await bcrypt.hash(password, 10);

  await adminRepository.createSuperAdminRepo({
    name,
    email,
    role: ADMIN_ROLES.SUPER_ADMIN,
    status: ADMIN_STATUS.ACTIVE,
    password: hashedPassword,
  });

  return {
    email,
    password: password,
  };
};

const loginSuperAdmin = async (email, password) => {
  const superAdmin = await adminRepository.loginSuperAdminRepo(email, password);

  if (!superAdmin) {
    throw new ValidationError("Invalid credentials");
  }

  const isValidPassword = await bcrypt.compare(password, superAdmin.password);

  if (!isValidPassword) {
    throw new ValidationError("Invalid credentials");
  }

  const jwtUser = {
    id: superAdmin.id,
    email: superAdmin.email,
    role: superAdmin.role,
  };

  const token = jwt.sign(jwtUser, process.env.JWT_SECRET_KEY, {
    expiresIn: "24h",
  });

  return token;
};

const addAdmin = async (email) => {
  const exitingAdmin = await adminRepository.retrieveAdminRepo({
    email,
    status: ADMIN_STATUS.ACTIVE,
  });
  if (exitingAdmin) {
    throw new Error("This user is already an admin");
  }

  const exitingInvitation = await adminRepository.retrieveAdminRepo({
    email,
    status: ADMIN_STATUS.INACTIVE,
  });

  if (exitingInvitation) {
    console.log(exitingInvitation);
    throw new Error("Invitation email already sent");
  }

  const hashedPassword = await bcrypt.hash("password", 10);
  const name = "Admin";

  const admin = await adminRepository.addAdminRepo({
    name: name,
    password: hashedPassword,
    email,
    role: ADMIN_ROLES.ADMIN,
    status: ADMIN_STATUS.INACTIVE,
  });

  if (admin) {
    const token = jwt.sign({ admin }, process.env.JWT_SECRET_KEY_ADMIN, {
      expiresIn: "24h",
    });
  

    try {
      await sendInvaiteEmail(email, token);
    } catch (error) {
      console.error("Error sending invitation email:", error);
      throw new Error("Admin added, but email failed to send.");
    }
  } else {
    throw new Error("Something happened while adding admin");
  }
};

const updateAdmin = async (email, data) => {
  await adminRepository.resetAdminDataRepo(email);

  const password = data.password;
  const hashedPassword = await bcrypt.hash(password, 10);

  const newAdminData = await adminRepository.resetAdminDataRepo(email, {
    password: hashedPassword,
    status: "active",
  });

  return newAdminData;
};

module.exports = {
  createSuperAdmin,
  loginSuperAdmin,
  addAdmin,
  updateAdmin,
};
