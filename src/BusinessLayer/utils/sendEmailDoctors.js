const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
const asyncHandler = require("express-async-handler");

const transport = nodemailer.createTransport({
  service: "gmail",
  // secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const sendResetDataEmail = async (email, token) => {
  const resetLink = `http://localhost:${process.env.PORT}/api/v1/clinic/doctors/reset-doctor-data?token=${token}`;

  const emailInfo = {
    from: process.env.EMAIL,
    to: email,
    subject: "Invaite to set your information",
    text: `Click on this link to reset your information: ${resetLink}`,
  };
  try {
    transport.sendMail(emailInfo);
    console.log("Invitation email sent successfully");
  } catch (error) {
    console.log(error);
  }
};

const sendActivateDoctorEmail = async (email) => {
  const emailInfo = {
    from: process.env.EMAIL,
    to: email,
    subject: "Email activation!",
    text: `Congratulations! Your account has been activated. You can now login with your account now.\n\n
    Login link: http://localhost:${process.env.PORT}/api/v1/clinic/doctors/login`,
  };
  try {
    transport.sendMail(emailInfo);
    console.log("Email activation sent successfully");
  } catch (error) {
    console.log(error);
  }
};

const sendDeleteEmail = async (email) => {
  const emailInfo = {
    from: process.env.EMAIL,
    to: email,
    subject: "Email deletion!",
    text: `Your account has been deleted. You can't login with your account again.`,
  };
  try {
    transport.sendMail(emailInfo);
    console.log("Email deletion sent successfully");
  } catch (error) {
    console.log(error);
  }
};

const sendActivateEmail = async (email, role) => {
  const emailInfo = {
    from: process.env.EMAIL,
    to: email,
    subject: "Email activation!",
    text: `Congratulations! Your account has been activated. You can now login with your account now.\n\n
    Your role is: ${role},\n\n
    Login link: http://localhost:${process.env.PORT}/api/v1/admins/login`,
  };
  try {
    transport.sendMail(emailInfo);
    console.log("Email activation sent successfully");
  } catch (error) {
    console.log(error);
  }
};

const sendDeactivateEmail = async (email) => {
  const emailInfo = {
    from: process.env.EMAIL,
    to: email,
    subject: "Email deactivation!",
    text: `Your account has been deactivated. You can't login with your account again.`,
  };
  try {
    transport.sendMail(emailInfo);
    console.log("Email deactivation sent successfully");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  sendResetDataEmail,
  sendActivateDoctorEmail,
  sendDeleteEmail,
  sendActivateEmail,
  sendDeactivateEmail,
};
