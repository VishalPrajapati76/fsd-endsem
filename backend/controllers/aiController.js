const axios = require("axios");
const Complaint = require("../models/Complaint");

/**
 * @desc    Analyze complaint using OpenRouter AI API
 * @route   POST /api/ai/analyze
 * @access  Public
 * Returns: priority, department, summary, autoResponse
 */
const analyzeComplaint = async (req, res, next) => {
  try {
    const { complaintId, title, description, category, location } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "title, description, and category are required for AI analysis",
      });
    }

    // Build the AI prompt
    const prompt = `You are an AI assistant for a Smart Complaint Management System for a municipal government.

Analyze the following complaint and respond ONLY with a valid JSON object (no markdown, no explanation):

Complaint Details:
- Title: ${title}
- Description: ${description}
- Category: ${category}
- Location: ${location || "Not specified"}

Respond with this exact JSON format:
{
  "priority": "<Low|Medium|High|Critical>",
  "department": "<exact department name responsible>",
  "summary": "<concise 1-2 sentence summary of the complaint>",
  "autoResponse": "<professional automated response message to the complainant, 2-3 sentences>"
}

Priority Guidelines:
- Critical: Life-threatening, infrastructure collapse, health hazard
- High: Severely affecting daily life, large area impact
- Medium: Moderate inconvenience, limited area
- Low: Minor issue, non-urgent

Department Guidelines based on category:
- Water Supply → Water & Sanitation Department
- Electricity → Power Distribution Department  
- Roads & Infrastructure → Public Works Department
- Sanitation & Garbage → Municipal Sanitation Department
- Public Safety → Police & Safety Department
- Healthcare → Health Department
- Education → Education Department
- Transport → Transport Authority
- Environment → Environment & Pollution Control Board
- Other → General Administration`;

    let aiResult;

    try {
      // Call OpenRouter API (supports many free/paid models)
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "mistralai/mistral-7b-instruct:free",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://complaint-management.onrender.com",
            "X-Title": "AI Complaint Management System",
          },
          timeout: 30000,
        }
      );

      const rawContent = response.data.choices[0].message.content.trim();

      // Extract JSON from the response (handle possible markdown code blocks)
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("AI did not return valid JSON");

      aiResult = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!aiResult.priority || !aiResult.department || !aiResult.summary || !aiResult.autoResponse) {
        throw new Error("AI response missing required fields");
      }
    } catch (aiError) {
      console.warn("AI API call failed, using rule-based fallback:", aiError.message);

      // Rule-based fallback when AI API is unavailable
      aiResult = getRuleBasedAnalysis(category, description, title);
    }

    // If a complaintId is provided, save the analysis to MongoDB
    if (complaintId) {
      await Complaint.findByIdAndUpdate(complaintId, {
        aiAnalysis: {
          priority: aiResult.priority,
          department: aiResult.department,
          summary: aiResult.summary,
          autoResponse: aiResult.autoResponse,
          analyzedAt: new Date(),
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "AI analysis completed successfully",
      data: {
        priority: aiResult.priority,
        department: aiResult.department,
        summary: aiResult.summary,
        autoResponse: aiResult.autoResponse,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rule-based fallback AI analysis
 * Used when OpenRouter API is unavailable or returns invalid response
 */
const getRuleBasedAnalysis = (category, description, title) => {
  const text = `${title} ${description}`.toLowerCase();

  // Determine priority based on keywords
  let priority = "Medium";
  const criticalKeywords = ["collapse", "fire", "flood", "accident", "death", "injury", "danger", "emergency", "explosion", "bleeding"];
  const highKeywords = ["damaged", "broken", "leakage", "shortage", "outage", "blockage", "overflow", "no water", "no electricity", "pothole"];
  const lowKeywords = ["minor", "small", "slow", "request", "suggest", "inform", "complaint about"];

  if (criticalKeywords.some((kw) => text.includes(kw))) priority = "Critical";
  else if (highKeywords.some((kw) => text.includes(kw))) priority = "High";
  else if (lowKeywords.some((kw) => text.includes(kw))) priority = "Low";

  // Department mapping
  const departmentMap = {
    "Water Supply": "Water & Sanitation Department",
    Electricity: "Power Distribution Department",
    "Roads & Infrastructure": "Public Works Department",
    "Sanitation & Garbage": "Municipal Sanitation Department",
    "Public Safety": "Police & Safety Department",
    Healthcare: "Health Department",
    Education: "Education Department",
    Transport: "Transport Authority",
    Environment: "Environment & Pollution Control Board",
    Other: "General Administration",
  };

  const department = departmentMap[category] || "General Administration";

  // Auto-generated summary and response
  const summary = `A ${priority.toLowerCase()} priority complaint regarding ${category.toLowerCase()} has been reported. The issue involves: ${title}.`;

  const responseMap = {
    Critical: "Your complaint has been marked as CRITICAL and escalated to emergency response teams immediately. Expect urgent action within 2-4 hours.",
    High: "Your complaint has been flagged as HIGH priority. The concerned department has been notified and will address the issue within 24 hours.",
    Medium: "Thank you for reporting this issue. Your complaint is under review and the concerned department will address it within 2-3 working days.",
    Low: "Your complaint has been registered. Our team will look into the matter and resolve it within 5-7 working days.",
  };

  const autoResponse = `Dear Complainant, thank you for reaching out to us. ${responseMap[priority]} Your complaint reference number has been generated for tracking. We apologize for any inconvenience caused.`;

  return { priority, department, summary, autoResponse };
};

/**
 * @desc    Get AI analysis for an existing complaint from DB
 * @route   GET /api/ai/analysis/:complaintId
 * @access  Public
 */
const getComplaintAnalysis = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.complaintId).select("aiAnalysis title category");

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    if (!complaint.aiAnalysis || !complaint.aiAnalysis.priority) {
      return res.status(404).json({
        success: false,
        message: "No AI analysis found for this complaint. Please analyze it first.",
      });
    }

    res.status(200).json({
      success: true,
      data: complaint.aiAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeComplaint, getComplaintAnalysis };
