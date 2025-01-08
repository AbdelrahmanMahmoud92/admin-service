const { Router } = require("express");

const router = Router();

const adminRoutes = require("./admins");
const userRoutes = require("./users");
const doctorRoutes = require("./doctors");

router.use("/v1/users", userRoutes);
router.use("/v1/admins", adminRoutes);
router.use("/v1/clinic", doctorRoutes);



module.exports = router;
