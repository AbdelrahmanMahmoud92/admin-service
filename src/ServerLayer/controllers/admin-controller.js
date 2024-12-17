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

const resetAdminData = asyncHandler(async (req, res) => {
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

  const currentAdmin = await adminService.updateAdmin(email, { password });

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

module.exports = {
  loginAdminController,
  sendInvaiteEmail,
  resetAdminData,
  updateAdminData,
};
