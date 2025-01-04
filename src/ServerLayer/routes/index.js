const { Router } = require("express");

const adminRoutes = require("./api");
const userRoutes = require("./api");

const router = Router();
router.use("/api", adminRoutes);
router.use("/api", userRoutes);

module.exports = router;
