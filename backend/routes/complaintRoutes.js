const express = require("express");
const router = express.Router();

const {
  addComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
  searchComplaintsByLocation,
  saveAiAnalysis,
} = require("../controllers/complaintController");

const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  validateComplaint,
  validateStatusUpdate,
} = require("../middlewares/validationMiddleware");

// ─────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────

// POST /api/complaints — Register new complaint
router.post("/", validateComplaint, addComplaint);

// GET /api/complaints — Get all complaints (with optional ?category=&status=&page=&limit=)
router.get("/", getAllComplaints);

// GET /api/complaints/search?location=Ghaziabad — Search by location
router.get("/search", searchComplaintsByLocation);

// GET /api/complaints/:id — Get single complaint
router.get("/:id", getComplaintById);

// ─────────────────────────────────────────────
// PROTECTED ROUTES (JWT required)
// ─────────────────────────────────────────────

// PUT /api/complaints/:id — Update complaint status (admin only)
router.put("/:id", protect, adminOnly, validateStatusUpdate, updateComplaintStatus);

// PATCH /api/complaints/:id/ai-analysis — Save AI analysis to complaint
router.patch("/:id/ai-analysis", saveAiAnalysis);

// DELETE /api/complaints/:id — Delete complaint (admin only)
router.delete("/:id", protect, adminOnly, deleteComplaint);

module.exports = router;
