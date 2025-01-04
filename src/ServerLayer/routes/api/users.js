const { Router } = require("express");

const router = Router();

const userController = require("../../controllers/user-controller");
const passport = require("passport");
const auth = require("../../middlewares/auth");
const { generateTokens } = require("../../../BusinessLayer/services/token.service");

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  (req, res) => {
    const user = req.user;

    const { token, refreshToken } = generateTokens(user);

    res.status(200).json({
      message: "Authentication successful",
      token,
      refreshToken,
    });
  }
);



router.get("/logout", auth, userController.logoutUserController);

router.post("/login", userController.loginUserController);

router.get(
  "/my-profile",
  auth,
  userController.retrieveCurrentUserController,
);

router.delete(
  "/disconnect-google",
  auth,
  userController.disconnectGoogle,
);

module.exports = router;
