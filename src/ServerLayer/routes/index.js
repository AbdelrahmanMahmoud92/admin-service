const { Router } = require("express");

const adminRoutes = require("./api");
const userRoutes = require("./api");
const doctorRoutes = require("./api");

const router = Router();
router.use("/api", adminRoutes);
router.use("/api", userRoutes);
router.use("/api", doctorRoutes);

module.exports = router;
