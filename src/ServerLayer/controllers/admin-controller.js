const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const adminService = require("../../BusinessLayer/services/admin-service");
const adminRepository = require("../../DataLayer/repositories/admin-repository");
const { ADMIN_ROLES } = require("../../BusinessLayer/enums/admin-roles");
const { ADMIN_STATUS } = require("../../BusinessLayer/enums/admin-status");

const loginAdminController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await adminRepository.loginAdminRepo(email, password);

  const token = await adminService.loginAdmin(email, password);

  res.status(200).json({
    message: "Admin logged in successfully",
    token: token,
  });
});

const sendInvaiteEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  await adminService.addAdmin(email);

  res.status(200).json({ message: "Invitation email sent successfully" });
});

const resetPassword = asyncHandler(async (req, res) => {
  const token = req.query.token;

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY_ADMIN);
    console.log(decodedToken);
  } catch (error) {
    console.log(error);
    return res.status(401).send("Invalid or expired token");
  }

  const { email } = decodedToken;
  const { password } = req.body;

  if (!password) {
    return res.status(400).send("Password is required");
  }

  const currentAdmin = await adminService.resetPassword(email, { password });

  res
    .status(200)
    .json({ message: "Password updated successfully. You can login now." });
});

// const updateAdminData = asyncHandler(async (req, res) => {
//   const user = req.user;
//   let { adminData } = req.body;

//   if (!adminData || Object.keys(adminData).length === 0) {
//     return res.status(400).send("No data provided for update");
//   }

//   if (adminData.password) {
//     return res
//       .status(400)
//       .json({ error: "Password update is not allowed through this endpoint" });
//   }

//   if (req.user.role === ADMIN_ROLES.ADMIN && req.params.id !== user.id) {
//     return res.status(403).send("You are not allowed to make this request");
//   }

//   const newAdminData = await adminService.updateAdminData(
//     req.params.id,
//     adminData
//   );
//   res
//     .status(200)
//     .json({ message: "Admin data updated successfully", data: newAdminData });
// });

const updateAdminData = asyncHandler(async (req, res) => {
  const user = req.user;
  const adminData = req.body;

  if (!adminData || Object.keys(adminData).length === 0) {
    return res.status(400).send("No data provided for update");
  }

  const targetId = req.params.id || user.id;
  if (user.role === ADMIN_ROLES.ADMIN && targetId !== user.id) {
    return res
      .status(403)
      .send("You are not allowed to modify other admins' data");
  }

  const newAdminData = await adminService.updateAdminData(targetId, adminData);

  res.status(200).json({
    message: "Admin data updated successfully",
    data: newAdminData,
  });
});

const deleteAdmin = asyncHandler(async (req, res) => {
  const user = req.user;
  const targetId = req.params.id;

  if (
    (user.role === ADMIN_ROLES.ADMIN && targetId !== user.id) ||
    (user.role === ADMIN_ROLES.ADMIN && targetId !== user.id)
  ) {
    return res
      .status(403)
      .send("You are not allowed to modify other admins' data");
  }
  if (user.role === ADMIN_ROLES.SUPER_ADMIN && targetId === user.id) {
    return res.status(403).send("Error: Super Admin cannot be deleted");
  }

  const deletedAdmin = await adminService.deleteAdmin(targetId);

  res.status(200).json({
    message: "Admin data deleted successfully",
    data: deletedAdmin,
  });
});

const activateAdmin = asyncHandler(async (req, res) => {
  const user = req.user;
  const targetId = req.params.id;

  if (
    (user.role === ADMIN_ROLES.ADMIN && targetId === user.id) ||
    (user.role === ADMIN_ROLES.ADMIN && targetId !== user.id)
  ) {
    return res
      .status(403)
      .send("You are not allowed to modify other admins' data");
  }

  if (user.role === ADMIN_ROLES.SUPER_ADMIN && targetId === user.id) {
    return res.status(403).send("Error: Super Admin cannot change status");
  }

  const activatedAdmin = await adminService.activateAdmin(targetId);

  res.status(200).json({
    message: "Admin activated successfully",
    data: activatedAdmin,
  });
});

const deactivateAdmin = asyncHandler(async (req, res) => {
  const user = req.user;
  const targetId = req.params.id;

  if (
    (user.role === ADMIN_ROLES.ADMIN && targetId !== user.id) ||
    (user.role === ADMIN_ROLES.ADMIN && targetId !== user.id)
  ) {
    return res
      .status(403)
      .send("You are not allowed to modify other admins' data");
  }

  if (user.role === ADMIN_ROLES.SUPER_ADMIN && targetId === user.id) {
    return res.status(403).send("Error: Super Admin cannot change status");
  }

  const deactivatedAdmin = await adminService.deactivateAdmin(targetId);

  res.status(200).json({
    message: "Admin deactivated successfully",
    data: deactivatedAdmin,
  });
});

const changeRole = asyncHandler(async (req, res) => {
  const user = req.user;
  const targetId = req.params.id;
  const { role } = req.body;
  if (!role) {
    return res.status(400).send("Role is required.");
  }

  if (user.role === ADMIN_ROLES.ADMIN) {
    return res
      .status(403)
      .send("You are not allowed to modify other admins' data");
  }

  if (user.role === ADMIN_ROLES.SUPER_ADMIN && targetId === user.id) {
    return res.status(403).send("Error: Super Admin cannot change role");
  }

  const updatedAdmin = await adminService.changeRole(targetId, role);

  res.status(200).json({
    message: `Admin role changed successfully to ${role}`,
    data: updatedAdmin,
  });
});

const retrieveAdmins = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.role !== ADMIN_ROLES.SUPER_ADMIN) {
    return res
      .status(403)
      .send("You are not allowed to modify other admins' data");
  }

  const admins = await adminService.retrieveAdmins();
  if (admins.length === 0)
    return res.status(202).json({ message: "No admins in the system" });

  res.status(200).json({
    message: "Admins retrieved successfully",
    data: admins,
  });
});

const retrieveSuperAdmins = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.role !== ADMIN_ROLES.SUPER_ADMIN) {
    return res
      .status(403)
      .send("You are not allowed to modify other admins' data");
  }
  const admins = await adminService.retrieveSuperAdmins();

  if (admins.length === 1 && !admins.includes(user.id))
    return res.status(202).json({ message: "No super admins in the system" });

  // Remove the current super admin from the list of super admins

  const filteredAdmins = admins.filter((admin) => admin.id !== user.id);

  res.status(200).json({
    message: "Admins retrieved successfully",
    data: filteredAdmins,
  });
});

const retrieveCurrentAdmin = asyncHandler(async (req, res) => {
  const user = req.user;
  const role = user.role;
  console.log(role);

  const admin = await adminService.retrieveCurrentAdmin(user.id);

  if (!admin) {
    return res.status(202).json({ message: "This page is not available." });
  }

  res.status(200).json({
    message: `${role} retrieved successfully`,
    data: user,
  });
});

const searchAdmins = asyncHandler(async (req, res) => {
  const filters = req.query;
  const user = req.user;
  if (user.role !== ADMIN_ROLES.SUPER_ADMIN) {
    return res
      .status(403)
      .send("You are not allowed to modify other admins' data");
  }
  let filterMessage = Object.entries(filters)
    .map(([key, value]) => {
      return `${value} ${key}`;
    })
    .join(", ");

  const admins = await adminService.searchAdmins(filters);
  res.status(200).json({
    message: `Admins with ${filterMessage} retrieved successfully`,
    data: admins,
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const user = req.user;
  const email = user.email;

  console.log(email);
  console.log(req.body.email);

  if (user.email !== req.body.email) {
    return res.status(401).send("Unauthorized");
  }

  await adminService.forgotPassword(email);

  res.status(200).json({
    message: "Password reset email sent successfully",
  });
});

module.exports = {
  loginAdminController,
  sendInvaiteEmail,
  resetPassword,
  updateAdminData,
  deleteAdmin,
  activateAdmin,
  deactivateAdmin,
  retrieveAdmins,
  retrieveSuperAdmins,
  retrieveCurrentAdmin,
  changeRole,
  searchAdmins,
  forgotPassword,
};
