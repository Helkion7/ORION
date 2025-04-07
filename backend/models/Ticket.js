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
      enum: ["open", "in progress", "solved"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
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
  },
  { timestamps: true }
);

// Add indexing for better query performance
TicketSchema.index({ user: 1, status: 1 });
TicketSchema.index({ status: 1, createdAt: -1 });
TicketSchema.index({ category: 1 });

module.exports = mongoose.model("Ticket", TicketSchema);
