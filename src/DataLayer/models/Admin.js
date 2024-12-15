const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');
const { ADMIN_STATUS } = require("../../BusinessLayer/enums/admin-status");

const adminSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4
    },

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        unique: true,
        required: true,
    }, 
    password: {
        type: String,
        required: true
    },
    // cityName: {
    //     type: String,
    //     ref: 'City',
    //     required: true
    // },

    status: {
        type: String, 
        enum: Object.values(ADMIN_STATUS),
        default: ADMIN_STATUS.ACTIVE
    },
    // cashAccount: {
    //     type: String, 
    //     ref: 'CashAccount',
    // }
}); 

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;