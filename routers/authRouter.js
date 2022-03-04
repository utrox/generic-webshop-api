const express = require("express");
const router = express.Router();
const {
  login,
  logout,
  register,
  recovery,
  requestRecovery,
  activateAccount,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/activate-account", activateAccount);
router.post("/login", login);
router.post("/logout", logout);
router.post("/request-recovery", requestRecovery);
router.post("/recovery", recovery);

module.exports = router;
