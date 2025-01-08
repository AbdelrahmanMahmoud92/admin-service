const { ADMIN_ROLES } = require("../../BusinessLayer/enums/admin-roles");
const { STATUS } = require("../../BusinessLayer/enums/status");
const Admin = require("../models/Admin");

// Function have an argument with properties and return a new format
const toDTO = ({ _id, name, email, password, status, role }) => {
  return {
    id: _id.toString(),
    name,
    email,
    password,
    status,
    role,
  };
};
const createSuperAdminRepo = async (data) => {
  const admin = await Admin.create(data);
  return toDTO(admin);
};

const loginAdminRepo = async (email, password) => {
  const admin = await Admin.findOne({
    email: email,
    status: STATUS.ACTIVE,
  });

  if (!admin) return null;

  return toDTO(admin);
};

const addAdminRepo = async (data) => {
  const admin = await Admin.create(data);
  return toDTO(admin);
};

const retrieveAdminRepo = async (filter) => {
  console.log(filter);
  const admin = await Admin.findOne(filter);
  return admin ? admin : null;
};

const resetAdminDataRepo = async (email, data) => {
  const admin = await Admin.findOneAndUpdate({ email }, data, { new: true });
  if (!admin) return null;

  console.log("ttttttttttttttttttttttttttttttttttttttttttt");
  return admin;
};
const updateAdminDataRepo = async (id, data) => {
  const admin = await Admin.findByIdAndUpdate(id, data, { new: true });
  if (!admin) return null;

  return admin;
};

// const deactivateAccount = async (id) => {
//   const admin = await Admin.findByIdAndUpdate(id, { status: STATUS.INACTIVE }, { new: true });
//   if (!admin)  return null;
//   return admin;
// };

const deleteAdminRepo = async (id) => {
  const admin = await Admin.findByIdAndDelete(id);
  if (!admin) return null;

  return admin;
};

const retrieveAdminsRepo = async (filter, pagination) => {
  const admins = await Admin.find(filter).skip(pagination).limit(pagination);

  return admins.map(toDTO);
};

const retrieveCurrentAdminRepo = async (id) => {
  const admin = await Admin.findById(id);
  if (!admin) return null;

  return toDTO(admin);
};

const searchAdminsRepo = async (filters) => {
  const query = {};
  if (filters.name) query.name = { $regex: filters.name, $options: "i" };

  // Searching until @
  if (filters.email) {
    const emailPrefix = filters.email.split("@")[0];
    query.email = { $regex: `^${emailPrefix}`, $options: "i" };
  }
  if (filters.status) query.status = filters.status;
  if (filters.role) query.role = filters.role;

  const admins = await Admin.find(query);
  return admins.map(toDTO);
};
module.exports = {
  createSuperAdminRepo,
  loginAdminRepo,
  addAdminRepo,
  retrieveAdminRepo,
  resetAdminDataRepo,
  updateAdminDataRepo,
  deleteAdminRepo,
  retrieveAdminsRepo,
  retrieveCurrentAdminRepo,
  searchAdminsRepo,
};
