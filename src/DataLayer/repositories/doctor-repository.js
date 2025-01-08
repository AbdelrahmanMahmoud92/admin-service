const { ADMIN_ROLES } = require("../../BusinessLayer/enums/admin-roles");
const { STATUS } = require("../../BusinessLayer/enums/status");
const Doctor = require("../models/Doctor");

// Function have an argument with properties and return a new format
const toDTO = ({ _id, name, email, password, specialization, experience }) => {
  return {
    id: _id.toString(),
    name,
    email,
    password,
    specialization,
    experience,
  };
};

const loginDoctorRepo = async (email, password) => {
  const doctor = await Doctor.findOne({
    email: email,
    status: STATUS.ACTIVE,
  });

  if (!doctor) return null;

  return toDTO(doctor);
};

const retrieveDoctorRepo = async (filter) => {
  console.log(filter);
  const doctor = await Doctor.findOne(filter);

  return doctor ? doctor : null;
};

const addDoctorRepo = async (data) => {
  const newDoctor = await Doctor.create(data);
  return toDTO(newDoctor);
};

const resestDoctorDataRepo = async (email, data) => {
  const doctor = await Doctor.findOneAndUpdate({ email }, data, { new: true });
  if (!doctor) return null;
  console.log("aaaaa");
  return doctor;
};


const updateDoctorDataRepo = async (id, data) => {
  const doctor = await Doctor.findByIdAndUpdate(id, data, { new: true });
  if (!doctor) return null;

  return doctor;
};

const deleteDoctorRepo = async (id) => {
  const doctor = await Doctor.findByIdAndDelete(id);
  if (!doctor) return null;

  return doctor;
};
const retrieveDoctorsRepo = async (filter, pagination) => {
  const doctors = await Doctor .find(filter).skip(pagination).limit(pagination);

  return doctors.map(toDTO);
};

const retrieveCurrentDoctorRepo = async (id) => {
  const doctor = await Doctor.findById(id);
  if (!doctor) return null;

  return toDTO(doctor);
};
const searchDoctorsRepo = async (filters) => {
  const query = {};
  if (filters.name) query.name = { $regex: filters.name, $options: "i" };

  // Searching until @
  if (filters.email) {
    const emailPrefix = filters.email.split("@")[0];
    query.email = { $regex: `^${emailPrefix}`, $options: "i" };
  }
  if (filters.status) query.status = filters.status;
  if (filters.specialization) query.specialization = filters.specialization;

  const doctors = await Doctor.find(query);
  return doctors.map(toDTO);
};

module.exports = {
  retrieveDoctorRepo,
  addDoctorRepo,
  resestDoctorDataRepo,
  loginDoctorRepo,
  updateDoctorDataRepo,
  deleteDoctorRepo,
  retrieveDoctorsRepo,
  retrieveCurrentDoctorRepo,
  searchDoctorsRepo,
};
