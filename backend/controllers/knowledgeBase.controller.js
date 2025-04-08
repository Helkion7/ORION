const KnowledgeBase = require("../models/KnowledgeBase");
const { validationResult } = require("express-validator");

// @desc    Create a new knowledge base entry
// @route   POST /api/knowledgebase
// @access  Private/Admin
exports.createEntry = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Create the entry
    const entry = await KnowledgeBase.create(req.body);

    res.status(201).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all knowledge base entries with search and filters
// @route   GET /api/knowledgebase
// @access  Private/Admin
exports.getEntries = async (req, res, next) => {
  try {
    let query = {};

    // Search functionality
    if (req.query.search) {
      query = {
        $or: [
          { title: { $regex: req.query.search, $options: "i" } },
          { content: { $regex: req.query.search, $options: "i" } },
          { tags: { $regex: req.query.search, $options: "i" } },
        ],
      };
    }

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Tags filter
    if (req.query.tag) {
      query.tags = req.query.tag;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await KnowledgeBase.countDocuments(query);

    // Execute query
    const entries = await KnowledgeBase.find(query)
      .sort({ title: 1 })
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: entries.length,
      pagination,
      total,
      data: entries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single knowledge base entry
// @route   GET /api/knowledgebase/:id
// @access  Private/Admin
exports.getEntry = async (req, res, next) => {
  try {
    const entry = await KnowledgeBase.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: `Entry not found with id ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid entry ID format",
      });
    }
    next(error);
  }
};

// @desc    Update knowledge base entry
// @route   PUT /api/knowledgebase/:id
// @access  Private/Admin
exports.updateEntry = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    let entry = await KnowledgeBase.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: `Entry not found with id ${req.params.id}`,
      });
    }

    entry = await KnowledgeBase.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid entry ID format",
      });
    }
    next(error);
  }
};

// @desc    Delete knowledge base entry
// @route   DELETE /api/knowledgebase/:id
// @access  Private/Admin
exports.deleteEntry = async (req, res, next) => {
  try {
    const entry = await KnowledgeBase.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: `Entry not found with id ${req.params.id}`,
      });
    }

    await entry.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid entry ID format",
      });
    }
    next(error);
  }
};

// @desc    Search related knowledge base entries by keywords from a ticket
// @route   GET /api/knowledgebase/search-related
// @access  Private/Admin
exports.searchRelated = async (req, res, next) => {
  try {
    const { title, category, description } = req.query;

    if (!title && !category && !description) {
      return res.status(400).json({
        success: false,
        error: "Please provide search parameters",
      });
    }

    // Create search query from ticket details
    const searchTerms = [];
    if (title)
      searchTerms.push(...title.split(" ").filter((word) => word.length > 3));
    if (description) {
      // Extract keywords from description - longer words are likely more meaningful
      const descWords = description
        .split(" ")
        .filter((word) => word.length > 4)
        .slice(0, 10); // Limit to top 10 words
      searchTerms.push(...descWords);
    }

    let query = {};

    // If we have search terms, use them
    if (searchTerms.length > 0) {
      const searchRegexes = searchTerms.map((term) => new RegExp(term, "i"));

      query = {
        $or: [
          { title: { $in: searchRegexes } },
          { content: { $in: searchRegexes } },
          { tags: { $in: searchRegexes } },
        ],
      };
    }

    // Add category filter if provided
    if (category) {
      query.category = category;
    }

    // Find matching entries
    const entries = await KnowledgeBase.find(query).limit(5);

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    next(error);
  }
};
