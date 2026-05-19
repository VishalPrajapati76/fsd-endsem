const Complaint = require("../models/Complaint");

/**
 * @desc    Add a new complaint
 * @route   POST /api/complaints
 * @access  Public
 */
const addComplaint = async (req, res, next) => {
  try {
    const { name, email, title, description, category, location } = req.body;

    const complaint = await Complaint.create({
      name,
      email,
      title,
      description,
      category,
      location,
      submittedBy: req.user ? req.user._id : null,
    });

    res.status(201).json({
      success: true,
      message: "Complaint registered successfully",
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all complaints with optional filters
 * @route   GET /api/complaints
 * @access  Public
 */
const getAllComplaints = async (req, res, next) => {
  try {
    const { category, status, page = 1, limit = 10 } = req.query;

    // Build filter object dynamically
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Complaint.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single complaint by ID
 * @route   GET /api/complaints/:id
 * @access  Public
 */
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update complaint status
 * @route   PUT /api/complaints/:id
 * @access  Private (Admin)
 */
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Complaint status updated to "${status}"`,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a complaint
 * @route   DELETE /api/complaints/:id
 * @access  Private (Admin)
 */
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search complaints by location
 * @route   GET /api/complaints/search?location=Ghaziabad
 * @access  Public
 */
const searchComplaintsByLocation = async (req, res, next) => {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: "Please provide a location to search",
      });
    }

    // Case-insensitive regex search for partial location match
    const complaints = await Complaint.find({
      location: { $regex: location, $options: "i" },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      query: location,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save AI analysis results back to a complaint
 * @route   PATCH /api/complaints/:id/ai-analysis
 * @access  Public (called internally after AI analysis)
 */
const saveAiAnalysis = async (req, res, next) => {
  try {
    const { priority, department, summary, autoResponse } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        aiAnalysis: {
          priority,
          department,
          summary,
          autoResponse,
          analyzedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "AI analysis saved successfully",
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
  searchComplaintsByLocation,
  saveAiAnalysis,
};
