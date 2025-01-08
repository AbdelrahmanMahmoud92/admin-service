const { Router } = require("express");
const router = Router();
const doctorController = require("../../controllers/doctor-controller");
const role = require("../../middlewares/check-role");
const auth = require("../../middlewares/auth");
const { ADMIN_ROLES } = require("../../../BusinessLayer/enums/admin-roles");


router.post(
    "/doctors/login",
    doctorController.loginDoctorController
);

router.post(
    "/super-admin/doctor-invataion",
    auth,
    role.check(ADMIN_ROLES.SUPER_ADMIN),
    doctorController.sendInvaiteEmail
);

router.patch("/doctors/reset-doctor-data", doctorController.resetDoctorData);

router.patch(
    "/doctors/update-doctor-data/:id?",
    auth,
    doctorController.updateDoctorData
);

router.delete(
    "/doctors/delete-doctor/:id?",
    auth,
    role.check(ADMIN_ROLES.SUPER_ADMIN),
    doctorController.deleteDoctor
)

router.patch(
    "/doctors/activate-doctor/:id?",
    auth,
    role.check(ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.ADMIN),
    doctorController.activateDoctor
);

router.patch(
    "/doctors/deactivate-doctor/:id?",
    auth,
    role.check(ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.ADMIN),
    doctorController.deactivateDoctor
);

router.get(
    "/doctors/my-profile",
    auth,
    doctorController.retrieveCurrentDoctor
);

router(
    "/doctors/ask-reset-password",
    auth,
    doctorController.forgotPassword
);

router.get(
    "/doctors/search-doctors",
    auth,
    role.check(ADMIN_ROLES.SUPER_ADMIN),
    doctorController.searchDoctors
)
module.exports = router;