const { Router } = require("express");

const router = Router();

const adminController = require("../../controllers/admin-controller");
const role = require("../../middlewares/check-role");
const auth = require("../../middlewares/auth");
const { ADMIN_ROLES } = require("../../../BusinessLayer/enums/admin-roles");
router.post("/login", adminController.loginAdminController);
router.post(
  "/super-admin/admin-invataion",
  auth,
  role.check(ADMIN_ROLES.SUPER_ADMIN),
  adminController.sendInvaiteEmail
);
router.patch("/reset-password", adminController.resetAdminData);

router.patch(
  "/update-admin-data/:id?",
  auth,
  role.check(ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPER_ADMIN),
  adminController.updateAdminData
);

module.exports = router;
