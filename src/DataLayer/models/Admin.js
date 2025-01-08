const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { STATUS } = require("../../BusinessLayer/enums/status");
const { ADMIN_ROLES } = require("../../BusinessLayer/enums/admin-roles");
const adminSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },

  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  // cityName: {
  //     type: String,
  //     ref: 'City',
  //     required: true
  // },

  status: {
    type: String,
    enum: Object.values(STATUS),
    default: STATUS.ACTIVE,
  },
  // cashAccount: {
  //     type: String,
  //     ref: 'CashAccount',
  // }
  role: {
    type: String,
    required: true,
    enum: Object.values(ADMIN_ROLES),
    // default: ADMIN_ROLES.ADMIN
  },
});

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
