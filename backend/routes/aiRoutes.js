const express = require("express");
const router = express.Router();

const { analyzeComplaint, getComplaintAnalysis } = require("../controllers/aiController");

// POST /api/ai/analyze — Analyze a complaint using AI
router.post("/analyze", analyzeComplaint);

// GET /api/ai/analysis/:complaintId — Get stored AI analysis for a complaint
router.get("/analysis/:complaintId", getComplaintAnalysis);

module.exports = router;
