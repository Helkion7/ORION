const mongoose = require("mongoose");

const KnowledgeBaseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Please provide content"],
      trim: true,
    },
    summary: {
      type: String,
      required: [true, "Please provide a short summary"],
      trim: true,
      maxlength: [300, "Summary cannot be more than 300 characters"],
    },
    category: {
      type: String,
      required: [true, "Please select a category"],
      enum: ["Hardware", "Software", "Network", "Security", "Account", "Other"],
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Add indexing for better search performance
KnowledgeBaseSchema.index({
  title: "text",
  content: "text",
  tags: "text",
  category: 1,
});

module.exports = mongoose.model("KnowledgeBase", KnowledgeBaseSchema);
