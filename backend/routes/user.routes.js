const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.middleware");
const { validateUpdateUser } = require("../middleware/validator.middleware");
const {
  sanitizeBody,
  sanitizeParams,
  sanitizeQuery,
} = require("../middleware/sanitizer.middleware");

// Import controllers
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  promoteUser,
} = require("../controllers/user.controller");

// All routes require auth
router.use(protect);

// Admin-only routes
router.route("/").get(authorize("admin"), sanitizeQuery, getUsers);
router.route("/promote").put(authorize("admin"), sanitizeBody, promoteUser);

// Individual user routes
router
  .route("/:id")
  .get(sanitizeParams, getUser)
  .put(validateUpdateUser, sanitizeBody, sanitizeParams, updateUser)
  .delete(authorize("admin"), sanitizeParams, deleteUser);

module.exports = router;
