const express = require("express");
const router = express.Router();

// Import controllers
const {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  deleteTicket,
  addResponse,
  getTicketStats,
} = require("../controllers/ticket.controller");

// Import middleware
const { protect, authorize } = require("../middleware/auth.middleware");
const {
  validateCreateTicket,
  validateUpdateTicket,
  validateAddResponse,
} = require("../middleware/validator.middleware");
const {
  sanitizeBody,
  sanitizeParams,
  sanitizeQuery,
} = require("../middleware/sanitizer.middleware");

// Rate limiting for ticket creation to prevent abuse
const rateLimit = require("express-rate-limit");
const ticketCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 ticket creations per hour
  message: "Too many tickets created, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// All routes below require authentication
router.use(protect);

// Routes for all authenticated users
router
  .route("/")
  .get(sanitizeQuery, getTickets) // Apply sanitization to query
  .post(
    ticketCreationLimiter,
    validateCreateTicket,
    sanitizeBody,
    createTicket
  ); // Apply sanitization to body

// Stats route (admin only)
router.route("/stats").get(authorize("admin"), getTicketStats);

// Individual ticket routes
router
  .route("/:id")
  .get(sanitizeParams, getTicket) // Apply sanitization to params
  .put(validateUpdateTicket, sanitizeBody, sanitizeParams, updateTicket) // Apply sanitization to body and params
  .delete(sanitizeParams, deleteTicket); // Apply sanitization to params

// Add response to ticket
router
  .route("/:id/responses")
  .post(validateAddResponse, sanitizeBody, sanitizeParams, addResponse); // Apply sanitization to body and params

module.exports = router;
