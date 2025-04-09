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
    const filterParams = ["status", "priority", "category", "supportLevel"];
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

    // NEW APPROACH: Simplified search handling
    // First find all tickets matching the base criteria
    const allMatchingTickets = await Ticket.find(baseQuery)
      .populate("user", "name email")
      .populate("assignedTo", "name email role")
      .populate("responses.respondedBy", "name email role")
      .sort(parseSortString(sortParam));

    // Then filter by search term if provided
    let filteredTickets = allMatchingTickets;

    if (req.query.search && req.query.search.trim()) {
      const searchTerm = req.query.search.trim();
      const searchRegex = new RegExp(searchTerm, "i");

      filteredTickets = allMatchingTickets.filter((ticket) => {
        // Check various fields for matches
        return (
          searchRegex.test(ticket.title) ||
          searchRegex.test(ticket.description) ||
          searchRegex.test(ticket.category) ||
          searchRegex.test(ticket._id.toString()) ||
          (ticket.user &&
            (searchRegex.test(ticket.user.name) ||
              searchRegex.test(ticket.user.email))) ||
          (ticket.assignedTo &&
            (searchRegex.test(ticket.assignedTo.name) ||
              searchRegex.test(ticket.assignedTo.email))) ||
          ticket.responses.some((response) => searchRegex.test(response.text))
        );
      });
    }

    // Calculate total for pagination
    const total = filteredTickets.length;

    // Apply pagination to the filtered results
    const paginatedTickets = filteredTickets.slice(skip, skip + limit);

    // Create pagination info
    const pagination = {};

    if (skip + paginatedTickets.length < total) {
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

    pagination.total = total;

    res.status(200).json({
      success: true,
      count: paginatedTickets.length,
      pagination,
      total,
      data: paginatedTickets,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching tickets",
      error: error.message,
    });
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

    // Check if user owns the ticket or is support staff
    if (
      ticket.user.toString() !== req.user.id &&
      !["admin", "firstLineSupport", "secondLineSupport"].includes(
        req.user.role
      )
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this ticket",
      });
    }

    // Validate assignedTo if present
    if ("assignedTo" in req.body) {
      // If null, undefined, or empty string, set to null (unassigned)
      if (
        req.body.assignedTo === null ||
        req.body.assignedTo === undefined ||
        req.body.assignedTo === ""
      ) {
        req.body.assignedTo = null;
      } else {
        // Otherwise check if it's a valid user ID
        const User = require("../models/User");
        const assignedUser = await User.findById(req.body.assignedTo);

        if (!assignedUser) {
          return res.status(400).json({
            success: false,
            error: "Assigned user not found",
          });
        }

        if (
          !["admin", "firstLineSupport", "secondLineSupport"].includes(
            assignedUser.role
          )
        ) {
          return res.status(400).json({
            success: false,
            error: "Tickets can only be assigned to support staff",
          });
        }

        // Add to assignment history if changed
        if (
          !ticket.assignedTo ||
          ticket.assignedTo.toString() !== req.body.assignedTo
        ) {
          ticket.assignmentHistory.push({
            assignedTo: req.body.assignedTo,
            assignedBy: req.user.id,
            supportLevel:
              assignedUser.role === "secondLineSupport"
                ? "secondLine"
                : "firstLine",
            assignedAt: new Date(),
          });
        }
      }
    }

    // Handle status changes and add to status history
    if (req.body.status && req.body.status !== ticket.status) {
      ticket.statusHistory.push({
        status: req.body.status,
        updatedBy: req.user.id,
        updatedAt: new Date(),
      });

      // If marking as completed, set the completedAt time
      if (req.body.status === "completed" && ticket.status !== "completed") {
        req.body.completedAt = new Date();
      }

      // If reopening, clear completedAt
      if (req.body.status !== "completed" && ticket.status === "completed") {
        req.body.completedAt = null;
      }
    }

    // Handle escalation to second line
    if (
      req.body.supportLevel === "secondLine" &&
      ticket.supportLevel !== "secondLine"
    ) {
      req.body.escalatedFrom = req.user.id;
      req.body.escalatedAt = new Date();

      // Add internal note about escalation if not already provided
      if (!req.body.escalationNote) {
        ticket.responses.push({
          text: `Escalated to Second Line Support by ${req.user.name}`,
          respondedBy: req.user.id,
          isInternal: true,
        });
      }
    }

    // Handle needs development flag
    if (
      req.body.devWorkRequired !== undefined &&
      // Only second line or admin can mark development work
      (req.user.role === "secondLineSupport" || req.user.role === "admin")
    ) {
      ticket.devWorkRequired = req.body.devWorkRequired;
    }

    // Role-based restrictions on what can be updated
    if (req.user.role === "firstLineSupport") {
      // First line can't directly assign to second line without escalation
      if (req.body.assignedTo) {
        const User = require("../.models/User");
        const assignedUser = await User.findById(req.body.assignedTo);
        if (
          assignedUser &&
          assignedUser.role === "secondLineSupport" &&
          req.body.supportLevel !== "secondLine"
        ) {
          return res.status(403).json({
            success: false,
            error:
              "First Line Support must escalate tickets to Second Line Support",
          });
        }
      }
    }

    // Regular users (non-support staff) can only update certain fields
    if (req.user.role === "user") {
      // Only allow users to update title, description, and category of their own tickets
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

    // Update ticket with filtered/validated fields
    const updateData = { ...req.body };
    ticket = await Ticket.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate([
      {
        path: "user",
        select: "name email",
      },
      {
        path: "assignedTo",
        select: "name email role",
      },
      {
        path: "responses.respondedBy",
        select: "name email role",
      },
      {
        path: "assignmentHistory.assignedTo",
        select: "name email role",
      },
      {
        path: "assignmentHistory.assignedBy",
        select: "name email role",
      },
      {
        path: "statusHistory.updatedBy",
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

// @desc    Escalate ticket to second line support
// @route   PUT /api/tickets/:id/escalate
// @access  Private
exports.escalateTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: `Ticket not found with id ${req.params.id}`,
      });
    }

    // Only first line support and admins can escalate
    if (!["firstLineSupport", "admin"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to escalate tickets",
      });
    }

    // Cannot escalate already second line tickets
    if (ticket.supportLevel === "secondLine") {
      return res.status(400).json({
        success: false,
        error: "Ticket is already at second line support",
      });
    }

    // Update ticket with escalation data
    const escalationNote =
      req.body.escalationNote || "Escalated to Second Line Support";

    ticket.supportLevel = "secondLine";
    ticket.escalatedFrom = req.user.id;
    ticket.escalatedAt = new Date();

    // Add internal note about escalation
    ticket.responses.push({
      text: `${escalationNote} by ${req.user.name}`,
      respondedBy: req.user.id,
      isInternal: true,
    });

    // If ticket was in open status, mark it as in progress
    if (ticket.status === "open") {
      ticket.status = "in progress";
      ticket.statusHistory.push({
        status: "in progress",
        updatedBy: req.user.id,
        updatedAt: new Date(),
      });
    }

    await ticket.save();

    // Get the fully populated ticket to return
    const updatedTicket = await Ticket.findById(req.params.id).populate([
      {
        path: "user",
        select: "name email",
      },
      {
        path: "assignedTo",
        select: "name email role",
      },
      {
        path: "responses.respondedBy",
        select: "name email role",
      },
      {
        path: "assignmentHistory.assignedTo",
        select: "name email role",
      },
      {
        path: "assignmentHistory.assignedBy",
        select: "name email role",
      },
      {
        path: "statusHistory.updatedBy",
        select: "name email role",
      },
    ]);

    // Emit socket event for updated ticket
    const io = req.app.get("io");
    io.emit("updateTicket", {
      ticket: updatedTicket,
    });

    res.status(200).json({
      success: true,
      data: updatedTicket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Return ticket to first line support
// @route   PUT /api/tickets/:id/returnToFirstLine
// @access  Private
exports.returnToFirstLine = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: `Ticket not found with id ${req.params.id}`,
      });
    }

    // Only second line support and admins can return tickets
    if (!["secondLineSupport", "admin"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to return tickets to first line",
      });
    }

    // Cannot return first line tickets
    if (ticket.supportLevel !== "secondLine") {
      return res.status(400).json({
        success: false,
        error: "Ticket is already at first line support",
      });
    }

    // Update ticket with return data
    const returnNote =
      req.body.returnNote || "Returned to First Line Support with instructions";

    ticket.supportLevel = "firstLine";

    // Add internal note about return
    ticket.responses.push({
      text: `${returnNote} by ${req.user.name}`,
      respondedBy: req.user.id,
      isInternal: true,
    });

    // If an assignee is specified, assign to that first line support agent
    if (req.body.assignToId) {
      const User = require("../models/User");
      const assignee = await User.findById(req.body.assignToId);

      if (!assignee || assignee.role !== "firstLineSupport") {
        return res.status(400).json({
          success: false,
          error: "Can only reassign to a First Line Support agent",
        });
      }

      ticket.assignedTo = req.body.assignToId;
      ticket.assignmentHistory.push({
        assignedTo: req.body.assignToId,
        assignedBy: req.user.id,
        supportLevel: "firstLine",
        assignedAt: new Date(),
      });
    } else {
      // If no specific assignee, unassign the ticket
      ticket.assignedTo = null;
    }

    await ticket.save();

    // Get the fully populated ticket to return
    const updatedTicket = await Ticket.findById(req.params.id).populate([
      {
        path: "user",
        select: "name email",
      },
      {
        path: "assignedTo",
        select: "name email role",
      },
      {
        path: "responses.respondedBy",
        select: "name email role",
      },
      {
        path: "assignmentHistory.assignedTo",
        select: "name email role",
      },
      {
        path: "assignmentHistory.assignedBy",
        select: "name email role",
      },
      {
        path: "statusHistory.updatedBy",
        select: "name email role",
      },
    ]);

    // Emit socket event for updated ticket
    const io = req.app.get("io");
    io.emit("updateTicket", {
      ticket: updatedTicket,
    });

    res.status(200).json({
      success: true,
      data: updatedTicket,
    });
  } catch (error) {
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

// Get ticket timeline data
exports.getTicketTimelineStats = async (req, res, next) => {
  try {
    // Get timeline of ticket creation
    const timelineData = await Ticket.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: "$_id.day",
                },
              },
            },
          },
          count: 1,
        },
      },
    ]);

    res.json({
      success: true,
      timelineData,
    });
  } catch (error) {
    next(error);
  }
};

// Get support staff performance stats
exports.getSupportStaffStats = async (req, res, next) => {
  try {
    // Get tickets assigned per support staff
    const assignedTickets = await Ticket.aggregate([
      {
        $match: {
          assignedTo: { $exists: true, $ne: null },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "assignedTo",
          foreignField: "_id",
          as: "assignedUser",
        },
      },
      {
        $unwind: "$assignedUser",
      },
      {
        $group: {
          _id: "$assignedTo",
          name: { $first: "$assignedUser.name" },
          ticketsAssigned: { $sum: 1 },
          // Calculate average response time (hours between assignment and first response)
          avgResponseTime: {
            $avg: {
              $cond: [
                { $gt: [{ $size: "$responses" }, 0] },
                {
                  $divide: [
                    {
                      $subtract: [
                        { $arrayElemAt: ["$responses.createdAt", 0] },
                        "$updatedAt",
                      ],
                    },
                    3600000, // Convert ms to hours
                  ],
                },
                0,
              ],
            },
          },
          ticketsSolved: {
            $sum: { $cond: [{ $eq: ["$status", "solved"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: 1,
          ticketsAssigned: 1,
          responseTime: { $abs: { $round: ["$avgResponseTime", 2] } }, // Convert to positive and round to 2 decimal places
          ticketsSolved: 1,
          solutionRate: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$ticketsSolved", "$ticketsAssigned"] },
                  100,
                ],
              },
              1,
            ],
          },
        },
      },
    ]);

    res.json({
      success: true,
      supportStaffStats: assignedTickets,
    });
  } catch (error) {
    next(error);
  }
};
