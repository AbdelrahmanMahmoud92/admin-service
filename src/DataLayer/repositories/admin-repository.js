const { ADMIN_ROLES } = require("../../BusinessLayer/enums/admin-roles");
const { ADMIN_STATUS } = require("../../BusinessLayer/enums/admin-status");
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
    status: ADMIN_STATUS.ACTIVE,
  });
  if (!admin) {
    return null;
  }
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
  if (!admin) {
    return null;
  }
  console.log("ttttttttttttttttttttttttttttttttttttttttttt");
  return admin;
};
const updateAdminDataRepo = async (id, data) => {
  const admin = await Admin.findByIdAndUpdate(id, data, { new: true });
  if (!admin) return null;

  return admin;
};

// const retrieveAdmins = async (filter, pagination) => {
//     const admins = await Admin.find(filter)
//       .skip(pagination.skip)
//       .limit(pagination.limit);

//     return clients.map(toDTO);
// };

module.exports = {
  createSuperAdminRepo,
  loginAdminRepo,
  addAdminRepo,
  retrieveAdminRepo,
  resetAdminDataRepo,
  updateAdminDataRepo,
};
