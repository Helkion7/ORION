const express = require("express");
const router = express.Router();

// Import controllers
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  promoteUser,
} = require("../controllers/user.controller");

// Import middleware
const { protect, authorize } = require("../middleware/auth.middleware");
const { validateUpdateUser } = require("../middleware/validator.middleware");

// All routes below require authentication
router.use(protect);

// All routes below require admin role
router.use(authorize("admin"));

// Routes for admin users only
router.route("/").get(getUsers);

router
  .route("/:id")
  .get(getUser)
  .put(validateUpdateUser, updateUser)
  .delete(deleteUser);

// Route for promoting a user to admin
router.route("/promote").put(promoteUser);

module.exports = router;
