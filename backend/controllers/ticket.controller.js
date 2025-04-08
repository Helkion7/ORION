const Ticket = require("../models/Ticket");
const { validationResult } = require("express-validator");

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private
exports.createTicket = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Add the current user ID to the ticket
    req.body.user = req.user.id;

    // Create the ticket
    const ticket = await Ticket.create(req.body);

    // Get the fully populated ticket to emit
    const populatedTicket = await Ticket.findById(ticket._id).populate([
      { path: "user", select: "name email" },
      { path: "assignedTo", select: "name email" },
    ]);

    // Emit socket event for new ticket
    const io = req.app.get("io");
    io.emit("newTicket", {
      ticket: populatedTicket,
    });

    res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private
exports.getTickets = async (req, res, next) => {
  try {
    let query;

    // If user is not admin, only show their tickets
    if (req.user.role !== "admin") {
      query = Ticket.find({ user: req.user.id });
    } else {
      // Admins can see all tickets
      query = Ticket.find();
    }

    // Copy req.query to add additional filtering
    const reqQuery = { ...req.query };

    // Fields to exclude from filtering
    const removeFields = ["select", "sort", "page", "limit"];
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string and operators ($gt, $gte, etc)
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // Finding resource with parsed query
    query = query.find(JSON.parse(queryStr));

    // Select specific fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt"); // Default sort by newest
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Ticket.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Populate with user info
    query = query.populate([
      {
        path: "user",
        select: "name email",
      },
      {
        path: "assignedTo",
        select: "name email",
      },
      {
        path: "responses.respondedBy",
        select: "name email role",
      },
    ]);

    // Execute query
    const tickets = await query;

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
      count: tickets.length,
      pagination,
      total,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate([
      {
        path: "user",
        select: "name email",
      },
      {
        path: "assignedTo",
        select: "name email",
      },
      {
        path: "responses.respondedBy",
        select: "name email role",
      },
    ]);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: `Ticket not found with id ${req.params.id}`,
      });
    }

    // Make sure user owns the ticket or is an admin
    if (
      ticket.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this ticket",
      });
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    // Check if error is a valid MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid ticket ID format",
      });
    }
    next(error);
  }
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private
exports.updateTicket = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    let ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: `Ticket not found with id ${req.params.id}`,
      });
    }

    // Check if user owns the ticket or is admin
    if (ticket.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this ticket",
      });
    }

    // Validate assignedTo if present
    if (req.body.assignedTo && req.body.assignedTo !== "") {
      // Fetch the user to check their role
      const User = require("../models/User");
      const assignedUser = await User.findById(req.body.assignedTo);

      if (!assignedUser || assignedUser.role !== "admin") {
        return res.status(400).json({
          success: false,
          error: "Tickets can only be assigned to admin users",
        });
      }
    }

    // Regular users can only update certain fields if they own the ticket
    if (req.user.role !== "admin") {
      // Only allow users to update title, description, and category
      const allowedUpdates = ["title", "description", "category"];
      const requestedUpdates = Object.keys(req.body);

      // Check for any updates that aren't allowed
      const isValidOperation = requestedUpdates.every((update) =>
        allowedUpdates.includes(update)
      );

      if (!isValidOperation) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to update these fields",
        });
      }
    }

    // Update ticket
    ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate([
      {
        path: "user",
        select: "name email",
      },
      {
        path: "assignedTo",
        select: "name email",
      },
      {
        path: "responses.respondedBy",
        select: "name email role",
      },
    ]);

    // Emit socket event for updated ticket
    const io = req.app.get("io");
    io.emit("updateTicket", {
      ticket,
    });

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    // Check if error is a valid MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid ticket ID format",
      });
    }
    next(error);
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private
exports.deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: `Ticket not found with id ${req.params.id}`,
      });
    }

    // Only admins or the ticket creator can delete it
    if (ticket.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this ticket",
      });
    }

    await ticket.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    // Check if error is a valid MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid ticket ID format",
      });
    }
    next(error);
  }
};

// @desc    Add response to ticket
// @route   POST /api/tickets/:id/responses
// @access  Private
exports.addResponse = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: `Ticket not found with id ${req.params.id}`,
      });
    }

    // Only ticket creator or admin can add responses
    if (ticket.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Not authorized to respond to this ticket",
      });
    }

    // For admin users, check if the response is internal
    const isInternal =
      req.user.role === "admin" && req.body.isInternal === true;

    // Create response object
    const newResponse = {
      text: req.body.text,
      respondedBy: req.user.id,
      isInternal,
    };

    // Add response to ticket
    ticket.responses.push(newResponse);

    // If admin responds and ticket is open, automatically set to in progress
    if (req.user.role === "admin" && ticket.status === "open") {
      ticket.status = "in progress";
      // If no admin is assigned, assign to the responding admin
      if (!ticket.assignedTo) {
        ticket.assignedTo = req.user.id;
      }
    }

    await ticket.save();

    // Populate the response with user info
    const updatedTicket = await Ticket.findById(req.params.id).populate([
      {
        path: "user",
        select: "name email",
      },
      {
        path: "assignedTo",
        select: "name email",
      },
      {
        path: "responses.respondedBy",
        select: "name email role",
      },
    ]);

    // Emit socket event for ticket response
    const io = req.app.get("io");
    io.emit("ticketResponse", {
      ticket: updatedTicket,
    });

    res.status(200).json({
      success: true,
      data: updatedTicket,
    });
  } catch (error) {
    // Check if error is a valid MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid ticket ID format",
      });
    }
    next(error);
  }
};

// @desc    Get ticket statistics for admins
// @route   GET /api/tickets/stats
// @access  Private/Admin
exports.getTicketStats = async (req, res, next) => {
  try {
    // Only admins can access statistics
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access ticket statistics",
      });
    }

    // Get counts by status
    const statusStats = await Ticket.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get counts by category
    const categoryStats = await Ticket.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get counts by priority
    const priorityStats = await Ticket.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    // Recent activity (last 5 days)
    const today = new Date();
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(today.getDate() - 5);

    const recentActivity = await Ticket.aggregate([
      {
        $match: {
          createdAt: { $gte: fiveDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusStats,
        categoryStats,
        priorityStats,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};
