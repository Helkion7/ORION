const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a ticket title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      trim: true,
      maxlength: [2000, "Description cannot be more than 2000 characters"],
    },
    category: {
      type: String,
      required: [true, "Please select a category"],
      enum: ["Hardware", "Software", "Network", "Security", "Account", "Other"],
    },
    status: {
      type: String,
      enum: [
        "open",
        "in progress",
        "resolved",
        "completed",
        "needs development",
        "reopened",
      ],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    supportLevel: {
      type: String,
      enum: ["firstLine", "secondLine"],
      default: "firstLine",
    },
    escalatedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    escalatedAt: {
      type: Date,
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    responses: [
      {
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: [1000, "Response cannot be more than 1000 characters"],
        },
        respondedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        isInternal: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    assignmentHistory: [
      {
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        assignedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        supportLevel: {
          type: String,
          enum: ["firstLine", "secondLine"],
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            "open",
            "in progress",
            "resolved",
            "completed",
            "needs development",
            "reopened",
          ],
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    devWorkRequired: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Add indexing for better query performance
TicketSchema.index({ user: 1, status: 1 });
TicketSchema.index({ status: 1, createdAt: -1 });
TicketSchema.index({ category: 1 });
TicketSchema.index({ supportLevel: 1, status: 1 });
TicketSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model("Ticket", TicketSchema);
