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
const {
  sendActivateEmail,
  sendDeactivateEmail,
  sendNewRoleEmail,
  sendResetEmail,
  sendDeleteEmail,
} = require("../utils/sendEmail");

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

const validateRole = async (role) => {
  if (!Object.values(ADMIN_ROLES).includes(role)) {
    throw new ValidationError("Invalid admin role");
  }
};

const validateEmail = async (email) => {
  if (!validator.isEmail(email)) {
    throw new ValidationError("Invalid email");
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

const loginAdmin = async (email, password) => {
  const admin = await adminRepository.loginAdminRepo(email, password);

  if (!admin) {
    throw new ValidationError("You are not an admin");
  }

  const isValidPassword = await bcrypt.compare(password, admin.password);

  if (!isValidPassword) {
    throw new ValidationError("Invalid credentials");
  }

  const jwtUser = {
    id: admin.id,
    email: admin.email,
    role: admin.role,
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
    const token = jwt.sign(admin, process.env.JWT_SECRET_KEY_ADMIN, {
      expiresIn: "24h",
    });

    console.log(token);

    try {
      await sendResetEmail(email, token);
    } catch (error) {
      console.error("Error sending invitation email:", error);
      throw new Error("Admin added, but email failed to send.");
    }
  } else {
    throw new Error("Something happened while adding admin");
  }
};

const resetPassword = async (email, data) => {
  const admin = await adminRepository.retrieveAdminRepo({ email });
  if (!admin) {
    throw new Error("Admin not found");
  }

  const password = data.password;
  const hashedPassword = await bcrypt.hash(password, 10);

  const newAdminData = await adminRepository.resetAdminDataRepo(email, {
    password: hashedPassword,
    status: ADMIN_STATUS.ACTIVE || "active",
  });

  return newAdminData;
};

const updateAdminData = async (id, data) => {
  await validateId(id);

  // It's not the place to change these data.
  if (data && data.status) throw new Error("Unexpected error");
  if (data && data.role) throw new Error("Unexpected error");
  if (data && data.password) throw new Error("Unexpected error");

  if (data && data.name) await validateName(data.name);
  if (data && data.email) await validateEmail(data.email);

  const admin = await adminRepository.retrieveAdminRepo({ _id: id });
  if (!admin) {
    throw new NotExistError("Admin not found");
  }

  if (
    admin.status === ADMIN_STATUS.INACTIVE &&
    data.status !== ADMIN_STATUS.ACTIVE
  ) {
    throw new Error("Admin is not active");
  }

  if ((data && data.role) || (data && data.status)) {
    // if (
    //   (admin.role !== ADMIN_ROLES.ADMIN && data.role) ||
    //   (admin.role !== ADMIN_ROLES.ADMIN && data.status)
    // ) {
    throw new Error("You are not allowed to change these data");
    // }
  }

  const newAdminData = await adminRepository.updateAdminDataRepo(id, data);

  return newAdminData;
};

const activateAdmin = async (id) => {
  const admin = await adminRepository.retrieveAdminRepo({ _id: id });
  if (!admin) {
    throw new NotExistError("Admin not found");
  }

  if (admin.status === ADMIN_STATUS.ACTIVE) {
    throw new Error("Admin is already active");
  }

  const updatedAdmin = await adminRepository.updateAdminDataRepo(id, {
    status: ADMIN_STATUS.ACTIVE,
  });
  try {
    await sendActivateEmail(admin.email);
  } catch (error) {
    console.error("Error sending activation email:", error);
    throw new Error("Admin became active, but email failed to send.");
  }

  return updatedAdmin;
};

const deactivateAdmin = async (id) => {
  const admin = await adminRepository.retrieveAdminRepo({ _id: id });
  if (!admin) {
    throw new NotExistError("Admin not found");
  }

  if (admin.status === ADMIN_STATUS.INACTIVE) {
    throw new Error("Admin is already inactive");
  }

  const updatedAdmin = await adminRepository.updateAdminDataRepo(id, {
    status: ADMIN_STATUS.INACTIVE,
  });

  try {
    await sendDeactivateEmail(admin.email);
  } catch (error) {
    console.error("Error sending deactivation email:", error);
    throw new Error("Admin became inactive, but email failed to send.");
  }
  return updatedAdmin;
};

const changeRole = async (id, role) => {
  const admin = await adminRepository.retrieveAdminRepo({ _id: id });
  if (!admin) {
    throw new NotExistError("Admin not found");
  }
  await validateRole(role);
  if (admin.role === role) {
    throw new Error("Admin already has this role");
  }

  const updatedAdmin = await adminRepository.updateAdminDataRepo(id, {
    role: role,
  });
  try {
    await sendNewRoleEmail(admin.email, role);
  } catch (error) {
    console.error("Error sending new role email:", error);
    throw new Error("Admin role changed, but email failed to send.");
  }
  return updatedAdmin;
};

// const toggleAdminStatus = async (id, status) => {
//   const admin = await adminRepository.retrieveAdminRepo({ _id: id });
//   if (!admin) {
//     throw new NotExistError("Admin not found");
//   }

//   if (status) validateStatus(status);

//   if (admin.status === status) {
//     throw new Error(`Admin is already ${status === ADMIN_STATUS.ACTIVE ? 'active' : 'inactive'}`);
//   }

//   const updatedAdmin = await adminRepository.updateAdminDataRepo(id,  status );
//   return updatedAdmin;
// };

const deleteAdmin = async (id) => {
  const admin = await adminRepository.retrieveAdminRepo({ _id: id });
  if (!admin) {
    throw new NotExistError("Admin not found");
  }

  if (admin.status === ADMIN_STATUS.INACTIVE) {
    throw new Error("Admin is not active");
  }

  const deletedAdmin = await adminRepository.deleteAdminRepo(id);
  try {
    await sendDeleteEmail(admin.email);
  } catch (error) {
    console.error("Error sending delete email:", error);
    throw new Error("Admin deleted, but email failed to send.");
  }
  return deletedAdmin;
};

const retrieveAdmins = async () => {
  const admins = await adminRepository.retrieveAdminsRepo({
    role: ADMIN_ROLES.ADMIN,
  });
  return admins;
};

const retrieveSuperAdmins = async () => {
  const admins = await adminRepository.retrieveAdminsRepo({
    role: ADMIN_ROLES.SUPER_ADMIN,
  });
  return admins;
};

const retrieveCurrentAdmin = async (id) => {
  const admin = await adminRepository.retrieveCurrentAdminRepo(id);
  if (!admin) {
    throw new NotExistError("Admin not found");
  }

  return admin;
};

const searchAdmins = async (filters) => {
  if (!filters || typeof filters !== "object") {
    throw new ValidationError("Filters must be an object");
  }

  const admins = await adminRepository.searchAdminsRepo(filters);
  if (admins.length === 0) {
    throw new NotExistError("No admins found with the provided filters");
  }

  return admins;
};

const forgotPassword = async (email) => {
  const admin = await adminRepository.retrieveAdminRepo({
    email,
    status: ADMIN_STATUS.ACTIVE,
  });
  if (!admin) {
    throw new NotExistError("Unable to find admin");
  }
  const adminPayload = {
    name: admin.name,
    password: admin.password,
    email: admin.email,
    role: admin.role,
    status: admin.status,
  };

  const token = jwt.sign(adminPayload, process.env.JWT_SECRET_KEY_ADMIN, {
    expiresIn: "15m",
  });

  try {
    await sendResetEmail(admin.email, token);
  } catch (error) {
    console.error("Error sending reset email:", error);
    throw new Error("Email failed to send.");
  }
};

module.exports = {
  createSuperAdmin,
  loginAdmin,
  addAdmin,
  resetPassword,
  updateAdminData,
  deleteAdmin,
  // toggleAdminStatus,
  deactivateAdmin,
  activateAdmin,
  retrieveAdmins,
  retrieveSuperAdmins,
  retrieveCurrentAdmin,
  changeRole,
  searchAdmins,
  forgotPassword,
};
//