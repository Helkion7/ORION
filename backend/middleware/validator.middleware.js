const { body, param } = require("express-validator");

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

  body("password").notEmpty().withMessage("Password is required"),

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

  body("newPassword").optional(),
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
  param("id").isMongoId().withMessage("Invalid ticket ID format"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description cannot be more than 2000 characters"),

  body("category")
    .optional()
    .isIn(["Hardware", "Software", "Network", "Security", "Account", "Other"])
    .withMessage("Please select a valid category"),

  body("status")
    .optional()
    .isIn([
      "open",
      "in progress",
      "resolved",
      "completed",
      "needs development",
      "reopened",
    ])
    .withMessage("Please select a valid status"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Please select a valid priority"),

  body("supportLevel")
    .optional()
    .isIn(["firstLine", "secondLine"])
    .withMessage("Invalid support level"),

  body("assignedTo")
    .optional()
    .custom(async (value, { req }) => {
      // Allow null, undefined, or empty string to unassign a ticket
      if (value === null || value === undefined || value === "") {
        return true;
      }

      try {
        const User = require("../models/User");
        const user = await User.findById(value);

        if (!user) {
          throw new Error("Assigned user not found");
        }

        // Check role permissions
        if (
          user.role !== "admin" &&
          user.role !== "firstLineSupport" &&
          user.role !== "secondLineSupport"
        ) {
          throw new Error("Tickets can only be assigned to support staff");
        }

        return true;
      } catch (err) {
        if (
          err.message === "Assigned user not found" ||
          err.message === "Tickets can only be assigned to support staff"
        ) {
          throw err;
        }
        throw new Error("Invalid user ID format");
      }
    }),

  body("devWorkRequired")
    .optional()
    .isBoolean()
    .withMessage("Dev work required must be a boolean value"),
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

// Validation middleware for knowledge base entries
exports.validateKnowledgeBase = [
  body("title")
    .notEmpty()
    .withMessage("Please provide a title")
    .isLength({ max: 200 })
    .withMessage("Title cannot be more than 200 characters"),

  body("content").notEmpty().withMessage("Please provide content"),

  body("summary")
    .notEmpty()
    .withMessage("Please provide a summary")
    .isLength({ max: 300 })
    .withMessage("Summary cannot be more than 300 characters"),

  body("category")
    .notEmpty()
    .withMessage("Please provide a category")
    .isIn(["Hardware", "Software", "Network", "Security", "Account", "Other"])
    .withMessage("Please select a valid category"),

  body("tags").optional().isArray().withMessage("Tags must be an array"),
];

// Validation for escalating a ticket to second line
exports.validateEscalateTicket = [
  param("id").isMongoId().withMessage("Invalid ticket ID format"),
  body("escalationNote")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Escalation note cannot be more than 500 characters"),
];

// Validation for returning a ticket to first line
exports.validateReturnTicket = [
  param("id").isMongoId().withMessage("Invalid ticket ID format"),
  body("returnNote")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Return note cannot be more than 500 characters"),
  body("assignToId")
    .optional()
    .isMongoId()
    .withMessage("Invalid user ID format")
    .custom(async (value) => {
      if (!value) return true;

      const User = require("../models/User");
      const user = await User.findById(value);

      if (!user) {
        throw new Error("Assigned user not found");
      }

      if (user.role !== "firstLineSupport") {
        throw new Error("Can only assign to First Line Support");
      }

      return true;
    }),
];
