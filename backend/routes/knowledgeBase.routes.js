const express = require("express");
const router = express.Router();

const {
  createEntry,
  getEntries,
  getEntry,
  updateEntry,
  deleteEntry,
  searchRelated,
} = require("../controllers/knowledgeBase.controller");

const { protect, authorize } = require("../middleware/auth.middleware");
const { validateKnowledgeBase } = require("../middleware/validator.middleware");
const {
  sanitizeBody,
  sanitizeParams,
  sanitizeQuery,
} = require("../middleware/sanitizer.middleware");

// All routes below require admin authentication
router.use(protect);
router.use(authorize("admin"));

router
  .route("/")
  .get(sanitizeQuery, getEntries)
  .post(validateKnowledgeBase, sanitizeBody, createEntry);

// Route for searching related entries from a ticket
router.route("/search-related").get(sanitizeQuery, searchRelated);

router
  .route("/:id")
  .get(sanitizeParams, getEntry)
  .put(validateKnowledgeBase, sanitizeBody, sanitizeParams, updateEntry)
  .delete(sanitizeParams, deleteEntry);

module.exports = router;
