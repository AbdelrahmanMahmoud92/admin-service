const {Router} = require("express");


const adminRoutes = require("./api")

const router = Router();
router.use("/api", adminRoutes);

module.exports = router;