const { Router } = require("express");

const router = Router();

const adminRoutes = require("./admins");
const userRoutes = require("./users");

router.use("/v1/users", userRoutes);
router.use("/v1/admins", adminRoutes);


module.exports = router;
