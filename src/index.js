const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("./BusinessLayer/config/passport.js");
const routes = require("./ServerLayer/routes");
const BlackListRedisClient = require("./BusinessLayer/config/redis.js") // Import the Redis client

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// إعداد Express
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// إعداد الجلسات
app.use(
  session({
    secret: "your_secret_key", // استبدل بـ secret آمن
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60, // ساعة واحدة
    },
  })
);

// إعداد Passport
app.use(passport.initialize());
app.use(passport.session());

// تعريف المسارات
app.use(routes);

// توصيل MongoDB وبدء الخادم
const init = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error during initialization:", error);
  }
};

init();