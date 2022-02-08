const express = require("express");
const router = express.Router();
const {
  login,
  logout,
  register,
  recovery,
  requestRecovery,
  recoveryInstructions,
  activateAccount,
} = require("../controllers/authController");

router.post("/register", register);
router.get("/activate-account/:activationToken", activateAccount);
router.post("/login", login);
router.post("/logout", logout);
router.post("/recovery", requestRecovery);
router.route("/recovery/:token").get(recoveryInstructions).post(recovery);

module.exports = router;
