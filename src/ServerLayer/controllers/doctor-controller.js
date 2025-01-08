const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const doctorService = require("../../BusinessLayer/services/doctor-service");
const doctorRepository = require("../../DataLayer/repositories/doctor-repository");
const { ADMIN_ROLES } = require("../../BusinessLayer/enums/admin-roles");
const { STATUS } = require("../../BusinessLayer/enums/status");

const loginDoctorController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const doctor = await doctorRepository.loginDoctorRepo(email, password);

  const token = await doctorService.loginDoctor(email, password);

  res.status(200).json({
    message: "Doctor logged in successfully",
    token: token,
  });
});

const sendInvaiteEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  await doctorService.addDoctor(email);

  res.status(200).json({ message: "Invitation email sent successfully" });
});

const resetDoctorData = asyncHandler(async (req, res) => {
  const token = req.query.token;

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY_DOCTOR);
    console.log(decodedToken);
  } catch (error) {
    console.log(error);
    return res.status(401).send("Invalid or expired token");
  }

  const { email } = decodedToken;
  const { password, specialization, experience, name } = req.body;
  if (!password || !specialization || !experience) {
    return res.status(400).send("All fields are required");
  }
  //   const hashedPassword = await bcrypt.hash(password, 10);
  await doctorService.resestDoctorData(email, {
    password,
    specialization,
    experience,
    name,
  });

  res
    .status(200)
    .json({ message: "Information updated successfully. You can login now." });
});

const updateDoctorData = asyncHandler(async (req, res) => {
  const user = req.user;
  const doctorData = req.body;

  if (!doctorData || Object.keys(doctorData).length === 0) {
    return res.status(400).send("No data provided for update");
  }

  const targetId = req.params.id || user.id;

  if (targetId !== user.id) {
    return res
      .status(403)
      .send("You are not allowed to modify other doctors' data");
  }

  const newDoctorData = await doctorService.updateDoctorData(
    targetId,
    doctorData
  );

  res.status(200).json({
    message: "Doctor data updated successfully",
    data: newDoctorData,
  });
});

const deleteDoctor = asyncHandler(async (req, res) => {
  const user = req.user;
  const targetId = req.params.id;

  const deletedDoctor = await doctorService.deleteDoctor(targetId);

  res.status(200).json({
    message: "Doctor data deleted successfully",
    data: deletedDoctor,
  });
});

const activateDoctor = asyncHandler(async (req, res) => {
  const user = req.user;
  const targetId = req.params.id;

  const activatedDoctor = await doctorService.activateDoctor(targetId);

  res.status(200).json({
    message: "Doctor activated successfully",
    data: activatedDoctor,
  });
});

const deactivateDoctor = asyncHandler(async (req, res) => {
  const user = req.user;
  const targetId = req.params.id;

  const deactivatedDoctor = await doctorService.deactivateDoctor(targetId);

  res.status(200).json({
    message: "Doctor deactivated successfully",
    data: deactivatedDoctor,
  });
});

const retrieveCurrentDoctor = asyncHandler(async (req, res) => {
  const user = req.user;

  const doctor = await doctorService.retrieveCurrentDoctor(user.id);

  if (!doctor) {
    return res.status(202).json({ message: "This page is not available." });
  }

  res.status(200).json({
    data: user,
  });
});

const searchDoctors = asyncHandler(async (req, res) => {
  const filters = req.query;
  const user = req.user;
  // if (user.role !== ADMIN_ROLES.SUPER_ADMIN) {
  //   return res
  //     .status(403)
  //     .send("You are not allowed to modify other admins' data");
  // }


  let filterMessage = Object.entries(filters)
    .map(([key, value]) => {
      return `${value} ${key}`;
    })
    .join(", ");

  const doctors = await doctorService.searchDoctors(filters);
  res.status(200).json({
    message: `Doctors with ${filterMessage} retrieved successfully`,
    data: doctors,
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

  await doctorService.forgotPassword(email);

  res.status(200).json({
    message: "Password reset email sent successfully",
  });
});


module.exports = {
  sendInvaiteEmail,
  resetDoctorData,
  loginDoctorController,
  updateDoctorData,
  deleteDoctor,
  activateDoctor,
  deactivateDoctor,
  retrieveCurrentDoctor,
  searchDoctors,
  forgotPassword
};
