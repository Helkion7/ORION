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
    // Build base query
    let baseQuery = {};

    // If user is not admin, only show their tickets
    if (req.user.role !== "admin") {
      baseQuery.user = req.user.id;
    }

    // Process search term
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      baseQuery.$or = [
        { title: searchRegex },
        { description: searchRegex },
        // We'll add user search through aggregation later
      ];
    }

    // Process role filter
    if (req.query.role) {
      if (req.query.role === "unassigned") {
        // Filter for tickets with no assignment
        baseQuery.assignedTo = { $exists: false };
      } else {
        // Find users with the specified role and get their IDs
        const User = require("../models/User");
        const usersWithRole = await User.find({ role: req.query.role }).select(
          "_id"
        );
        const userIds = usersWithRole.map((user) => user._id);
        baseQuery.assignedTo = { $in: userIds };
      }
    }

    // Copy basic filter parameters
    const filterParams = ["status", "priority", "category"];
    filterParams.forEach((param) => {
      if (req.query[param]) {
        baseQuery[param] = req.query[param];
      }
    });

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sortParam = req.query.sort || "-createdAt";

    // Execute query with aggregation for better search capabilities
    const tickets = await Ticket.aggregate([
      { $match: baseQuery },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "assignedTo",
          foreignField: "_id",
          as: "assignedToData",
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$userData", 0] },
          assignedTo: { $arrayElemAt: ["$assignedToData", 0] },
        },
      },
      // Add search for user name/email if search term exists
      ...(req.query.search
        ? [
            {
              $match: {
                $or: [
                  { "user.name": new RegExp(req.query.search, "i") },
                  { "user.email": new RegExp(req.query.search, "i") },
                  { "assignedTo.name": new RegExp(req.query.search, "i") },
                  { "assignedTo.email": new RegExp(req.query.search, "i") },
                  // The baseQuery already has title and description
                ],
              },
            },
          ]
        : []),
      { $sort: parseSortString(sortParam) },
      { $skip: skip },
      { $limit: limit },
      // Clean up temporary fields
      {
        $project: {
          userData: 0,
          assignedToData: 0,
        },
      },
    ]);

    // Get total count for pagination
    const total = await Ticket.countDocuments(baseQuery);

    // Pagination result
    const pagination = {};

    if (skip + tickets.length < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (skip > 0) {
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

// Helper function to parse sort string
function parseSortString(sortString) {
  const result = {};
  const fields = sortString.split(" ");

  fields.forEach((field) => {
    if (field.startsWith("-")) {
      result[field.substring(1)] = -1;
    } else {
      result[field] = 1;
    }
  });

  return result;
}

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

      if (
        !assignedUser ||
        (assignedUser.role !== "admin" &&
          assignedUser.role !== "firstLineSupport" &&
          assignedUser.role !== "secondLineSupport")
      ) {
        return res.status(400).json({
          success: false,
          error: "Tickets can only be assigned to support staff",
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

    // Get counts by role of assignedTo users
    const roleStats = await Ticket.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "assignedTo",
          foreignField: "_id",
          as: "assignedUser",
        },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $gt: [{ $size: "$assignedUser" }, 0] },
              then: { $arrayElemAt: ["$assignedUser.role", 0] },
              else: null,
            },
          },
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
        roleStats,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard of admins by resolved tickets
// @route   GET /api/tickets/leaderboard
// @access  Private/Admin
exports.getAdminLeaderboard = async (req, res, next) => {
  try {
    // Use MongoDB aggregation to count resolved tickets by admin
    const leaderboard = await Ticket.aggregate([
      // Match only solved tickets that have been assigned
      {
        $match: { status: "solved", assignedTo: { $exists: true, $ne: null } },
      },
      // Group by assignedTo and count tickets
      { $group: { _id: "$assignedTo", ticketCount: { $sum: 1 } } },
      // Lookup admin details from User collection
      {
        $lookup: {
          from: "users", // assuming your User model creates a "users" collection
          localField: "_id",
          foreignField: "_id",
          as: "adminDetails",
        },
      },
      // Unwind the adminDetails array to get a flat structure
      { $unwind: "$adminDetails" },
      // Project only the fields we need
      {
        $project: {
          _id: 1,
          adminName: "$adminDetails.name",
          adminEmail: "$adminDetails.email",
          ticketCount: 1,
        },
      },
      // Sort by ticketCount descending
      { $sort: { ticketCount: -1 } },
    ]);

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard,
    });
  } catch (error) {
    console.error("Error fetching admin leaderboard:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching admin leaderboard",
    });
  }
};
