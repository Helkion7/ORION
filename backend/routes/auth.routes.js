const express = require("express");
const router = express.Router();

// Import controllers
const {
  register,
  login,
  logout,
  getMe,
} = require("../controllers/auth.controller");

// Import middleware
const { protect } = require("../middleware/auth.middleware");
const {
  validateRegister,
  validateLogin,
} = require("../middleware/validator.middleware");

// Register and login routes (public)
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/logout", logout);

// Protected routes (require authentication)
router.get("/me", protect, getMe);

module.exports = router;
