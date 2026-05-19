const { body, param, query, validationResult } = require("express-validator");

/**
 * Helper to extract validation errors and return formatted response
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Validation rules for complaint registration
 */
const validateComplaint = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Complaint title is required")
    .isLength({ min: 5 })
    .withMessage("Title must be at least 5 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isIn([
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
    ])
    .withMessage("Invalid category selected"),

  body("location")
    .trim()
    .notEmpty()
    .withMessage("Location is required")
    .isLength({ min: 2 })
    .withMessage("Location must be at least 2 characters"),

  handleValidationErrors,
];

/**
 * Validation rules for status update
 */
const validateStatusUpdate = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["Pending", "In Progress", "Resolved", "Rejected"])
    .withMessage("Status must be one of: Pending, In Progress, Resolved, Rejected"),

  handleValidationErrors,
];

/**
 * Validation rules for user registration
 */
const validateUserRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  handleValidationErrors,
];

/**
 * Validation rules for user login
 */
const validateUserLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),

  body("password").notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

module.exports = {
  validateComplaint,
  validateStatusUpdate,
  validateUserRegister,
  validateUserLogin,
};
