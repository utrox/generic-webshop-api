const express = require("express");
const router = express.Router();
const {
  login,
  logout,
  register,
  recovery,
  requestRecovery,
  recoveryInstructions,
} = require("../controllers/authController");

router.post("/login", login);
router.post("/logout", logout);
router.post("/register", register);
router.post("/recovery", requestRecovery);
router.route("/recovery/:token").get(recoveryInstructions).post(recovery);

module.exports = router;
