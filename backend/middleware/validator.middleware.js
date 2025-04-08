const { body } = require("express-validator");

// Validation middleware for register route
exports.validateRegister = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .trim()
    .isLength({ max: 50 })
    .withMessage("Name cannot be more than 50 characters"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage('Role must be either "user" or "admin"'),
];

// Validation middleware for login route
exports.validateLogin = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

// Validation middleware for updating user
exports.validateUpdateUser = [
  body("name")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Name cannot be more than 50 characters")
    .trim(),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage('Role must be either "user" or "admin"'),
];

// Validation middleware for updating user profile
exports.validateUpdateProfile = [
  body("name")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Name cannot be more than 50 characters")
    .trim(),

  body("currentPassword")
    .optional()
    .notEmpty()
    .withMessage("Current password is required when changing password"),

  body("newPassword")
    .optional()
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .withMessage(
      "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
];

// Validation middleware for creating tickets
exports.validateCreateTicket = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .trim()
    .isLength({ max: 100 })
    .withMessage("Title cannot be more than 100 characters"),

  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description cannot be more than 2000 characters"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn(["Hardware", "Software", "Network", "Security", "Account", "Other"])
    .withMessage("Invalid category selected"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Invalid priority selected"),
];

// Validation middleware for updating tickets
exports.validateUpdateTicket = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),

  body("category")
    .optional()
    .isIn(["Hardware", "Software", "Network", "Security", "Account", "Other"])
    .withMessage("Please select a valid category"),

  body("status")
    .optional()
    .isIn(["open", "in progress", "solved"])
    .withMessage("Please select a valid status"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Please select a valid priority"),

  body("assignedTo")
    .optional()
    .custom(async (value, { req }) => {
      if (value === "") return true;

      const User = require("../models/User");
      const user = await User.findById(value);

      if (!user) {
        throw new Error("Assigned user not found");
      }

      if (user.role !== "admin") {
        throw new Error("Tickets can only be assigned to admin users");
      }

      return true;
    }),
];

// Validation middleware for adding responses to tickets
exports.validateAddResponse = [
  body("text")
    .notEmpty()
    .withMessage("Response text is required")
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Response cannot be more than 1000 characters"),

  body("isInternal")
    .optional()
    .isBoolean()
    .withMessage("isInternal must be a boolean value"),
];
