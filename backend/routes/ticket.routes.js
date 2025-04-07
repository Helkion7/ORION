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
  .post(ticketCreationLimiter, validateCreateTicket, createTicket) // Create ticket with rate limiting
  .get(getTickets); // Get all tickets (filtered by permissions)

// Stats route (admin only)
router.route("/stats").get(authorize("admin"), getTicketStats);

// Individual ticket routes
router
  .route("/:id")
  .get(getTicket)
  .put(validateUpdateTicket, updateTicket)
  .delete(deleteTicket);

// Add response to ticket
router.route("/:id/responses").post(validateAddResponse, addResponse);

module.exports = router;
