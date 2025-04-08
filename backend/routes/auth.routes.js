const express = require("express");
const router = express.Router();
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
} = require("../middleware/validator.middleware");
const { sanitizeBody } = require("../middleware/sanitizer.middleware");
const { protect } = require("../middleware/auth.middleware");

// Import controllers
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
} = require("../controllers/auth.controller");

// Routes
router.post("/register", validateRegister, sanitizeBody, register);
router.post("/login", validateLogin, sanitizeBody, login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put(
  "/profile",
  protect,
  validateUpdateProfile,
  sanitizeBody,
  updateProfile
);

module.exports = router;
