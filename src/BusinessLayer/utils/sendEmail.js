const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const asyncHandler = require("express-async-handler");

dotenv.config();

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const sendInvaiteEmail = async (email, token) => {
  const resetLink = `http://localhost:${process.env.PORT}/reset-password/${token}`;

  const emailInfo = {
    from: process.env.EMAIL,
    to: email,
    subject: "Invaite to set your password admin",
    text: `Click on this link to reset your password: ${resetLink}`,
  };
  try {
    transport.sendMail(emailInfo);
    console.log("Invitation email sent successfully");
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendInvaiteEmail;
