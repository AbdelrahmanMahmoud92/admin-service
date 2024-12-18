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

const sendResetEmail = async (email, token) => {
  const resetLink = `http://localhost:${process.env.PORT}/api/v1/admins/reset-password?token=${token}`;

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

const sendActivateEmail = async (email) => {
  const emailInfo = {
    from: process.env.EMAIL,
    to: email,
    subject: "Email activation!",
    text: `Congratulations! Your account has been activated. You can now login with your account now.\n\n
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

const sendNewRoleEmail = async (email, role) => {
  const emailInfo = {
    from: process.env.EMAIL,
    to: email,
    subject: "New role!",
    text: `You have been given a new role. Your new role is: ${role}`,
  };
  try {
    transport.sendMail(emailInfo);
    console.log("New role sent successfully");
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

// const sendLastNewsEmail = async (email) => {
//   const emailInfo = {
//     from: process.env.EMAIL,
//     to: email,
//     subject: "Last news!",
//     text: ``,
//   };
//   try {
//     transport.sendMail(emailInfo);
//     console.log("New role sent successfully");
//   } catch (error) {
//     console.log(error);
//   }
// };

module.exports = {
  sendResetEmail,
  sendActivateEmail,
  sendDeactivateEmail,
  sendNewRoleEmail,
  sendDeleteEmail,
};
