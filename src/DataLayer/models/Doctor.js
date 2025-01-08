const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { STATUS } = require("../../BusinessLayer/enums/status");

const doctorSchema = new mongoose.Schema({
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
    specialization: {
        type: String,
        // required: true,
    },
    experience: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: Object.values(STATUS),
        default: STATUS.ACTIVE,
      },
});

const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;    