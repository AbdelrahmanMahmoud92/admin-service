const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../../DataLayer/models/User");
const handleGoogleUserService =
  require("../services/user-service").handleGoogleUserService;
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/v1/users/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await handleGoogleUserService(profile);
        done(null, user);
      } catch (error) {
        console.error("Error in Google Strategy:", error);
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

module.exports = passport;
