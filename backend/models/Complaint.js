const mongoose = require("mongoose");

/**
 * Complaint Schema
 * Stores all complaint details including AI analysis results
 */
const ComplaintSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    title: {
      type: String,
      required: [true, "Complaint title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
    },
    description: {
      type: String,
      required: [true, "Complaint description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Water Supply",
        "Electricity",
        "Roads & Infrastructure",
        "Sanitation & Garbage",
        "Public Safety",
        "Healthcare",
        "Education",
        "Transport",
        "Environment",
        "Other",
      ],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
    },
    // AI Analysis Results
    aiAnalysis: {
      priority: {
        type: String,
        enum: ["Low", "Medium", "High", "Critical"],
        default: null,
      },
      department: {
        type: String,
        default: null,
      },
      summary: {
        type: String,
        default: null,
      },
      autoResponse: {
        type: String,
        default: null,
      },
      analyzedAt: {
        type: Date,
        default: null,
      },
    },
    // Reference to the user who submitted (optional for public complaints)
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Index for faster search by location and category
ComplaintSchema.index({ location: "text", title: "text", description: "text" });
ComplaintSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model("Complaint", ComplaintSchema);
