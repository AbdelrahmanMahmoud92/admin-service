const validator = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const doctorRepository = require("../../DataLayer/repositories/doctor-repository");
const { STATUS } = require("../enums/status");
const {
  ValidationError,
  NotExistError,
  InvalidStatusError,
} = require("../errors/index");
const {
  sendResetDataEmail,
  sendActivateDoctorEmail,
  sendDeleteEmail,
  sendActivateEmail,
  sendDeactivateEmail,
} = require("../utils/sendEmailDoctors");

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
  if (!Object.values(STATUS).includes(status)) {
    throw new InvalidStatusError("Invalid admin status");
  }
};
const validateEmail = async (email) => {
  if (!validator.isEmail(email)) {
    throw new ValidationError("Invalid email");
  }
};

const loginDoctor = async (email, password) => {
  const doctor = await doctorRepository.loginDoctorRepo(email, password);
  console.log(doctor);
  if (!doctor) {
    throw new ValidationError("You are not a doctor");
  }
  const isValidPassword = await bcrypt.compare(password, doctor.password);

  if (!isValidPassword) {
    throw new ValidationError("Invalid credentials");
  }

  const jwtDoctor = {
    id: doctor.id,
    email: doctor.email,
    // specialization: doctor.specialization,
  };
  const token = jwt.sign(jwtDoctor, process.env.JWT_SECRET_KEY_DOCTOR, {
    expiresIn: "24h",
  });

  if (doctor.status === STATUS.INACTIVE) {
    throw new InvalidStatusError("Your account is inactive");
  }

  return token;
};

const addDoctor = async (email) => {
  const exitingDoctor = await doctorRepository.retrieveDoctorRepo({
    email,
    status: STATUS.ACTIVE,
  });

  if (exitingDoctor) {
    throw new Error("Doctor already exists");
  }

  const exitingInvitation = await doctorRepository.retrieveDoctorRepo({
    email,
    status: STATUS.INACTIVE,
  });

  if (exitingInvitation) {
    throw new Error("Invitation email already sent");
  }

  const hashedPassword = await bcrypt.hash("password", 10);
  const name = "Doctor";
  console.log(hashedPassword);

  const doctor = await doctorRepository.addDoctorRepo({
    name: name,
    password: hashedPassword,
    email,
    specialization: "",
    experience: 0,
    status: STATUS.INACTIVE,
  });

  if (doctor) {
    const token = jwt.sign(doctor, process.env.JWT_SECRET_KEY_DOCTOR, {
      expiresIn: "24h",
    });
    try {
      await sendResetDataEmail(email, token);
    } catch (error) {
      console.error("Error sending reset email:", error);
      throw new Error("Email failed to send");
    }
  } else {
    throw new Error("Failed to add doctor");
  }
};

const resestDoctorData = async (email, data) => {
  const doctor = await doctorRepository.retrieveDoctorRepo({ email });
  if (!doctor) {
    throw new NotExistError("Unable to find doctor");
  }

  const name = data.name;
  const password = data.password;
  const specialization = data.specialization;
  const experience = data.experience;

  const hashedPassword = await bcrypt.hash(password, 10);

  const newDoctorData = await doctorRepository.resestDoctorDataRepo(email, {
    name: name,
    password: hashedPassword,
    status: STATUS.ACTIVE || "active",
    specialization: specialization,
    experience: experience,
  });
  await sendActivateDoctorEmail(email);

  return newDoctorData;
};

const updateDoctorData = async (id, data) => {
  await validateId(id);

  // It's not the place to change these data.
  if (data && data.status) throw new Error("Unexpected error");
  if (data && data.experience) throw new Error("Unexpected error");
  if (data && data.password) throw new Error("Unexpected error");
  if (data && data.specialization) throw new Error("Unexpected error");

  if (data && data.name) await validateName(data.name);
  if (data && data.email) await validateEmail(data.email);

  const doctor = await doctorRepository.retrieveDoctorRepo({ _id: id });
  if (!doctor) {
    throw new NotExistError("Doctor not found");
  }

  if (doctor.status === STATUS.INACTIVE && data.status !== STATUS.ACTIVE) {
    throw new Error("Doctor is not active");
  }

  if (data && data.status) {
    // if (
    //   (admin.role !== ADMIN_ROLES.ADMIN && data.role) ||
    //   (admin.role !== ADMIN_ROLES.ADMIN && data.status)
    // ) {
    throw new Error("You are not allowed to change these data");
    // }
  }

  const newDoctorData = await doctorRepository.updateDoctorDataRepo(id, data);

  return newDoctorData;
};
const deleteDoctor = async (id) => {
  const doctor = await doctorRepository.retrieveDoctorRepo({ _id: id });
  if (!doctor) {
    throw new NotExistError("Doctor not found");
  }

  if (doctor.status === STATUS.INACTIVE) {
    throw new Error("Doctor is not active");
  }

  const deletedDoctor = await doctorRepository.deleteAdminRepo(id);
  try {
    await sendDeleteEmail(doctor.email);
  } catch (error) {
    console.error("Error sending delete email:", error);
    throw new Error("Doctor deleted, but email failed to send.");
  }
  return deletedDoctor;
};
const retrieveCurrentDoctor = async (id) => {
  const doctor = await doctorRepository.retrieveCurrentDoctorRepo(id);
  if (!doctor) {
    throw new NotExistError("Doctor not found");
  }

  return doctor;
};
const searchDoctors = async (filters) => {
  if (!filters || typeof filters !== "object") {
    throw new ValidationError("Filters must be an object");
  }

  const doctors = await doctorRepository.searchDoctorsRepo(filters);
  if (doctors.length === 0) {
    throw new NotExistError("No doctors found with the provided filters");
  }

  return doctors;
};
const forgotPassword = async (email) => {
  const doctor = await doctorRepository.retrieveDoctorRepo({
    email,
    status: STATUS.ACTIVE,
  });
  if (!doctor) {
    throw new NotExistError("Unable to find doctor");
  }
  const doctorPayload = {
    name: admin.name,
    password: admin.password,
    email: admin.email,
    role: admin.role,
    status: admin.status,
  };

  const token = jwt.sign(doctorPayload, process.env.JWT_SECRET_KEY_ADMIN, {
    expiresIn: "15m",
  });

  try {
    await sendResetDataEmail(doctor.email, token);
  } catch (error) {
    console.error("Error sending reset email:", error);
    throw new Error("Email failed to send.");
  }
};

const activateDoctor = async (id) => {
  const doctor = await doctorRepository.retrieveDoctorRepo({ _id: id });
  if (!doctor) {
    throw new NotExistError("Doctor not found");
  }

  if (doctor.status === STATUS.ACTIVE) {
    throw new Error("Doctor is already active");
  }

  const updatedDoctor = await doctorRepository.updateDoctorDataRepo(id, {
    status: STATUS.ACTIVE,
  });
  try {
    await sendActivateEmail(doctor.email);
  } catch (error) {
    console.error("Error sending activation email:", error);
    throw new Error("Doctor became active, but email failed to send.");
  }

  return updatedDoctor;
};

const deactivateDoctor = async (id) => {
  const doctor = await doctorRepository.retrieveDoctorRepo({ _id: id });
  if (!doctor) {
    throw new NotExistError("Doctor not found");
  }

  if (doctor.status === STATUS.INACTIVE) {
    throw new Error("Doctor is already inactive");
  }

  const updatedDoctor = await doctorRepository.updateDoctorDataRepo(id, {
    status: STATUS.INACTIVE,
  });

  try {
    await sendDeactivateEmail(doctor.email);
  } catch (error) {
    console.error("Error sending deactivation email:", error);
    throw new Error("Doctor became inactive, but email failed to send.");
  }
  return updatedDoctor;
};

module.exports = {
  addDoctor,
  resestDoctorData,
  loginDoctor,
  updateDoctorData,
  deleteDoctor,
  retrieveCurrentDoctor,
  searchDoctors,
  forgotPassword,
  activateDoctor,
  deactivateDoctor,
};

