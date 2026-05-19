import React, { useState } from "react";
import { analyzeComplaint } from "../services/api";
import toast from "react-hot-toast";
import { Cpu, Zap, Building2, FileText, MessageSquare } from "lucide-react";

const CATEGORIES = ["Water Supply","Electricity","Roads & Infrastructure","Sanitation & Garbage","Public Safety","Healthcare","Education","Transport","Environment","Other"];
const PRIORITY_BADGE = { Critical:"badge-critical", High:"badge-high", Medium:"badge-medium", Low:"badge-low" };
const PRIORITY_DESC = { Critical:"🚨 Emergency — Immediate action required", High:"⚠️ Urgent — Action within 24 hours", Medium:"📋 Moderate — Action within 3 days", Low:"✅ Minor — Action within a week" };

const EXAMPLES = [
  { title:"Water Leakage Issue", description:"Water pipeline is badly damaged near the main market area. Water is flowing onto the road causing traffic and wastage.", category:"Water Supply", location:"Ghaziabad" },
  { title:"Street Light Not Working", description:"All street lights on Main Road are not working for the past 3 days. This is causing accidents and safety issues at night.", category:"Electricity", location:"Delhi" },
  { title:"Garbage Not Collected", description:"Garbage has not been collected from our area for over a week. It is piling up and causing a foul smell and health hazard.", category:"Sanitation & Garbage", location:"Noida" },
];

const AIAnalyzer = () => {
  const [form, setForm] = useState({ title:"", description:"", category:"", location:"" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category) { toast.error("Title, description, and category are required"); return; }
    setLoading(true); setResult(null);
    try {
      const { data } = await analyzeComplaint(form);
      setResult(data.data);
      toast.success("AI analysis complete!");
    } catch (err) { toast.error(err.response?.data?.message || "AI analysis failed"); }
    finally { setLoading(false); }
  };

  const loadExample = (ex) => { setForm({ ...ex }); setResult(null); };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">AI Complaint Analyzer</h1>
        <p className="page-subtitle">Enter complaint details to get AI-powered priority, department, summary and auto-response.</p>
      </div>

      <div style={{ marginBottom:"1.5rem" }}>
        <p style={{ fontSize:"0.82rem", color:"var(--text-muted)", marginBottom:"0.75rem" }}>Quick examples:</p>
        <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} className="btn btn-secondary btn-sm" onClick={() => loadExample(ex)}>
              {ex.category}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap:"1.5rem" }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Cpu size={18} style={{ color:"var(--accent-blue)", marginRight:8, verticalAlign:"middle" }} />Analyze Complaint</div>
          </div>
          <form onSubmit={handleAnalyze}>
            <div className="form-group">
              <label className="form-label">Complaint Title *</label>
              <input name="title" value={form.title} onChange={handleChange} className="form-control" placeholder="Brief title of the complaint" />
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="form-control" placeholder="Detailed description..." rows={5} />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select name="category" value={form.category} onChange={handleChange} className="form-control">
                  <option value="">Select Category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input name="location" value={form.location} onChange={handleChange} className="form-control" placeholder="e.g. Ghaziabad" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width:"100%" }} disabled={loading}>
              <Cpu size={16} /> {loading ? "Analyzing with AI..." : "Run AI Analysis"}
            </button>
          </form>
        </div>

        {result && (
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            <div className="card" style={{ borderColor: result.priority === "Critical" ? "var(--accent-red)" : result.priority === "High" ? "var(--accent-orange)" : "var(--border)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"0.5rem" }}>
                <Zap size={18} style={{ color:"var(--accent-blue)" }} />
                <span style={{ fontWeight:700, fontSize:"1rem" }}>Priority Level</span>
              </div>
              <span className={`badge ${PRIORITY_BADGE[result.priority]}`} style={{ fontSize:"0.95rem", padding:"0.5rem 1.2rem" }}>{result.priority}</span>
              <p style={{ color:"var(--text-secondary)", fontSize:"0.85rem", marginTop:"0.75rem" }}>{PRIORITY_DESC[result.priority]}</p>
            </div>

            <div className="card">
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"0.75rem" }}>
                <Building2 size={18} style={{ color:"var(--accent-purple)" }} />
                <span style={{ fontWeight:700 }}>Responsible Department</span>
              </div>
              <p style={{ color:"var(--text-primary)", fontWeight:600, fontSize:"1rem" }}>{result.department}</p>
            </div>

            <div className="card">
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"0.75rem" }}>
                <FileText size={18} style={{ color:"var(--accent-cyan)" }} />
                <span style={{ fontWeight:700 }}>AI Summary</span>
              </div>
              <p style={{ color:"var(--text-secondary)", fontSize:"0.9rem", lineHeight:"1.7" }}>{result.summary}</p>
            </div>

            <div className="card">
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"0.75rem" }}>
                <MessageSquare size={18} style={{ color:"var(--accent-green)" }} />
                <span style={{ fontWeight:700 }}>Auto-Generated Response</span>
              </div>
              <div className="ai-response">{result.autoResponse}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalyzer;
