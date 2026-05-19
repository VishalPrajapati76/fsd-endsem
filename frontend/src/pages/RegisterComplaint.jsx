import React, { useState } from "react";
import { addComplaint, analyzeComplaint } from "../services/api";
import toast from "react-hot-toast";
import { Send, Cpu, CheckCircle } from "lucide-react";

const CATEGORIES = [
  "Water Supply","Electricity","Roads & Infrastructure",
  "Sanitation & Garbage","Public Safety","Healthcare",
  "Education","Transport","Environment","Other"
];

const PRIORITY_COLORS = { Critical:"badge-critical", High:"badge-high", Medium:"badge-medium", Low:"badge-low" };

const RegisterComplaint = () => {
  const [form, setForm] = useState({
    name:"", email:"", title:"", description:"", category:"", location:""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [aiResult, setAiResult] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email format";
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim() || form.description.length < 10) e.description = "Description must be at least 10 characters";
    if (!form.category) e.category = "Category is required";
    if (!form.location.trim()) e.location = "Location is required";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const { data } = await addComplaint(form);
      setSubmitted(data.data);
      toast.success("Complaint registered successfully!");
      // Auto-run AI analysis
      setAiLoading(true);
      try {
        const ai = await analyzeComplaint({
          complaintId: data.data._id,
          title: form.title,
          description: form.description,
          category: form.category,
          location: form.location,
        });
        setAiResult(ai.data.data);
        toast.success("AI analysis complete!");
      } catch { toast("AI analysis skipped", { icon: "ℹ️" }); }
      finally { setAiLoading(false); }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit complaint");
    } finally { setLoading(false); }
  };

  if (submitted) return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Complaint Registered!</h1>
        <p className="page-subtitle">Your complaint has been submitted successfully.</p>
      </div>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <div className="card-header">
          <div>
            <div className="card-title"><CheckCircle size={18} style={{ color:"var(--accent-green)", marginRight:8, verticalAlign:"middle" }} />{submitted.title}</div>
            <div className="card-subtitle">ID: {submitted._id}</div>
          </div>
          <span className="badge badge-pending">Pending</span>
        </div>
        <div className="form-grid">
          {[["Name", submitted.name],["Email", submitted.email],["Category", submitted.category],["Location", submitted.location]].map(([l,v]) => (
            <div key={l}><p style={{ fontSize:"0.75rem", color:"var(--text-muted)", marginBottom:3, textTransform:"uppercase" }}>{l}</p><p style={{ color:"var(--text-primary)", fontWeight:600 }}>{v}</p></div>
          ))}
        </div>
      </div>
      {aiLoading && <div className="ai-panel"><div className="ai-panel-header"><Cpu size={18} /> Analyzing with AI...</div><div style={{ color:"var(--text-secondary)", fontSize:"0.88rem" }}>Please wait while the AI processes your complaint...</div></div>}
      {aiResult && (
        <div className="ai-panel">
          <div className="ai-panel-header"><Cpu size={18} /> AI Analysis Result</div>
          <div className="ai-grid">
            <div className="ai-item"><label>Priority</label><span className={`badge ${PRIORITY_COLORS[aiResult.priority]}`}>{aiResult.priority}</span></div>
            <div className="ai-item"><label>Responsible Department</label><p>{aiResult.department}</p></div>
            <div className="ai-item" style={{ gridColumn:"1/-1" }}><label>Summary</label><p>{aiResult.summary}</p></div>
          </div>
          <div><p style={{ fontSize:"0.75rem", color:"var(--text-muted)", textTransform:"uppercase", marginBottom:8 }}>Auto-Generated Response</p><div className="ai-response">{aiResult.autoResponse}</div></div>
        </div>
      )}
      <button className="btn btn-primary" style={{ marginTop:"1.5rem" }} onClick={() => { setSubmitted(null); setAiResult(null); setForm({ name:"", email:"", title:"", description:"", category:"", location:"" }); }}>
        Submit Another Complaint
      </button>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Register Complaint</h1>
        <p className="page-subtitle">Submit your complaint. AI will automatically analyze priority and recommend a department.</p>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className={`form-control ${errors.name?"error":""}`} placeholder="e.g. Rahul Kumar" />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className={`form-control ${errors.email?"error":""}`} placeholder="e.g. rahul@gmail.com" />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Complaint Title *</label>
            <input name="title" value={form.title} onChange={handleChange} className={`form-control ${errors.title?"error":""}`} placeholder="e.g. Water Leakage Issue" />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Complaint Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} className={`form-control ${errors.description?"error":""}`} placeholder="Describe the issue in detail..." rows={4} />
            {errors.description && <p className="form-error">{errors.description}</p>}
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className={`form-control ${errors.category?"error":""}`}>
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="form-error">{errors.category}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Location *</label>
              <input name="location" value={form.location} onChange={handleChange} className={`form-control ${errors.location?"error":""}`} placeholder="e.g. Ghaziabad" />
              {errors.location && <p className="form-error">{errors.location}</p>}
            </div>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"0.5rem" }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              <Send size={16} /> {loading ? "Submitting..." : "Submit Complaint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterComplaint;
