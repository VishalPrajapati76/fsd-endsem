require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middlewares/errorMiddleware");

// Import Routes
const complaintRoutes = require("./routes/complaintRoutes");
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");

// Initialize Express App
const app = express();

// ─────────────────────────────────────────────
// Connect to MongoDB
// ─────────────────────────────────────────────
connectDB();

// ─────────────────────────────────────────────
// Core Middlewares
// ─────────────────────────────────────────────

// CORS — allow frontend origin
app.use(
  cors({
    origin: function (origin, callback) {
      const allowed = [
        "http://localhost:3000",
        "http://localhost:5173",
      ];
      // Allow any onrender.com subdomain for production
      if (!origin || allowed.includes(origin) || /\.onrender\.com$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


// Parse incoming JSON bodies
app.use(express.json());

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────
app.use("/api/complaints", complaintRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "✅ AI Complaint Management System API is running",
    version: "1.0.0",
    endpoints: {
      complaints: "/api/complaints",
      auth: "/api/auth",
      ai: "/api/ai",
    },
  });
});

// ─────────────────────────────────────────────
// Error Handling Middlewares (must be last)
// ─────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`📡 API: http://localhost:${PORT}`);
});
