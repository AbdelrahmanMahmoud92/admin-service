const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },

});

const User = mongoose.model("User", userSchema);

module.exports = User;
