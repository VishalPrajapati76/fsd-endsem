const express = require("express");
const router = express.Router();

const { registerUser, loginUser, getMe } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const {
  validateUserRegister,
  validateUserLogin,
} = require("../middlewares/validationMiddleware");

// POST /api/auth/register — Register new user
router.post("/register", validateUserRegister, registerUser);

// POST /api/auth/login — Login and get JWT token
router.post("/login", validateUserLogin, loginUser);

// GET /api/auth/me — Get current user profile (protected)
router.get("/me", protect, getMe);

module.exports = router;
