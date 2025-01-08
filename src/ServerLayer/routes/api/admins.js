const { Router } = require("express");

const router = Router();

const adminController = require("../../controllers/admin-controller");
const userController = require("../../controllers/user-controller");
const role = require("../../middlewares/check-role");
const auth = require("../../middlewares/auth");
const { ADMIN_ROLES } = require("../../../BusinessLayer/enums/admin-roles");
const passport = require("passport");
router.post(
  "/login",
  adminController.loginAdminController
);
router.post(
  "/super-admin/admin-invataion",
  auth,
  role.check(ADMIN_ROLES.SUPER_ADMIN),
  adminController.sendInvaiteEmail
);

router.patch("/reset-password", adminController.resetPassword);

router.patch(
  "/update-admin-data/:id?",
  auth,
  role.check(ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPER_ADMIN),
  adminController.updateAdminData
);

// Senstive route
router.delete(
  "/super-admin/delete-admin/:id?",
  auth,
  role.check(ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPER_ADMIN),
  adminController.deleteAdmin
);

router.patch(
  "/super-admin/activate-admin/:id?",
  auth,
  role.check(ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPER_ADMIN),
  adminController.activateAdmin
);

router.patch(
  "/super-admin/deactivate-admin/:id?",
  auth,
  role.check(ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPER_ADMIN),
  adminController.deactivateAdmin
);

router.get(
  "/super-admin/retrieve-admins",
  auth,
  role.check(ADMIN_ROLES.SUPER_ADMIN),
  adminController.retrieveAdmins
);

router.get(
  "/super-admin/retrieve-super-admins",
  auth,
  role.check(ADMIN_ROLES.SUPER_ADMIN),
  adminController.retrieveSuperAdmins
);

router.get(
  "/my-profile",
  auth,
  role.check(ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPER_ADMIN),
  adminController.retrieveCurrentAdmin
);

router.patch(
  "/change-role/:id?",
  auth,
  role.check(ADMIN_ROLES.SUPER_ADMIN),
  adminController.changeRole
);

router.get(
  "/super-admin/search-admins",
  auth,
  role.check(ADMIN_ROLES.SUPER_ADMIN),
  adminController.searchAdmins
);

router.post(
  "/ask-reset-password",
  auth,
  role.check(ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPER_ADMIN),
  adminController.forgotPassword
);


// Users
router.get(
  "/retrieve-users",
  auth,
  role.check(ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.ADMIN),
  userController.retrieveAllUsersController,
)

router.get(
  "/search-users",
  auth,
  role.check(ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.ADMIN),
  userController.searchUsersController
  
)
module.exports = router;
