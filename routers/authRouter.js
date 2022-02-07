const express = require("express");
const router = express.Router();
const { login, logout, register } = require("../controllers/authController");

router.post("/login", login);
router.post("/logout", logout);
router.post("/register", register);

module.exports = router;
