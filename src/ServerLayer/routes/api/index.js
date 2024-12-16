const { Router } = require("express")

const router = Router();

const adminRoutes = require("./admins");

router.use("/v1/admins", adminRoutes);

module.exports = router;