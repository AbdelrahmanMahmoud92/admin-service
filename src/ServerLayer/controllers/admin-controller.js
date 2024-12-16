const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const adminService = require("../../BusinessLayer/services/admin-service");
const adminRepository = require("../../DataLayer/repositories/admin-repository");

const loginAdminController = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  await adminRepository.loginAdminRepo(email, password);

//   if (admin.status === "inactive") {
//     return res.status(401).json({ message: "Your account is not active" });
//   }

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
  console.log(currentAdmin);

  res
    .status(200)
    .json({ message: "Password updated successfully. You can login now." });
});

module.exports = {
  loginAdminController,
  sendInvaiteEmail,
  resetAdminData,
};
