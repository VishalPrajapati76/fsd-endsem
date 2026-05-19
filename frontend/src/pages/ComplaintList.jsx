import React, { useEffect, useState, useCallback } from "react";
import { getAllComplaints, searchByLocation, updateComplaintStatus, deleteComplaint } from "../services/api";
import { analyzeComplaint } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Search, Filter, Trash2, Cpu, RefreshCw, Eye } from "lucide-react";

const CATEGORIES = ["All","Water Supply","Electricity","Roads & Infrastructure","Sanitation & Garbage","Public Safety","Healthcare","Education","Transport","Environment","Other"];
const STATUSES = ["All","Pending","In Progress","Resolved","Rejected"];
const STATUS_BADGE = { Pending:"badge-pending","In Progress":"badge-progress", Resolved:"badge-resolved", Rejected:"badge-rejected" };
const PRIORITY_BADGE = { Critical:"badge-critical", High:"badge-high", Medium:"badge-medium", Low:"badge-low" };

const ComplaintList = () => {
  const { isAdmin } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      if (search.trim()) {
        const { data } = await searchByLocation(search);
        setComplaints(data.data);
      } else {
        const params = {};
        if (category !== "All") params.category = category;
        if (status !== "All") params.status = status;
        const { data } = await getAllComplaints(params);
        setComplaints(data.data);
      }
    } catch { toast.error("Failed to load complaints"); }
    finally { setLoading(false); }
  }, [search, category, status]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateComplaintStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      fetchComplaints();
      if (selected?._id === id) setSelected(p => ({ ...p, status: newStatus }));
    } catch (err) { toast.error(err.response?.data?.message || "Update failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this complaint?")) return;
    try {
      await deleteComplaint(id);
      toast.success("Complaint deleted");
      fetchComplaints();
      if (selected?._id === id) setSelected(null);
    } catch (err) { toast.error(err.response?.data?.message || "Delete failed"); }
  };

  const handleAiAnalyze = async (c) => {
    setAiLoading(true); setAiResult(null);
    try {
      const { data } = await analyzeComplaint({ complaintId: c._id, title: c.title, description: c.description, category: c.category, location: c.location });
      setAiResult(data.data);
      toast.success("AI analysis complete!");
    } catch { toast.error("AI analysis failed"); }
    finally { setAiLoading(false); }
  };

  return (
    <div>
      <div className="page-header" style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h1 className="page-title">All Complaints</h1>
          <p className="page-subtitle">{complaints.length} complaint(s) found</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchComplaints}><RefreshCw size={15} /> Refresh</button>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrap">
          <Search size={15} />
          <input className="form-control" placeholder="Search by location..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ flex:"0 0 180px" }} value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="form-control" style={{ flex:"0 0 150px" }} value={status} onChange={e => setStatus(e.target.value)}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <button className="btn btn-secondary" onClick={fetchComplaints}><Filter size={14} /> Filter</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns: selected ? "1fr 420px" : "1fr", gap:"1.5rem" }}>
        <div>
          {loading ? <div className="spinner" /> : complaints.length === 0 ? (
            <div className="empty-state"><Search size={48} /><h3>No complaints found</h3><p>Try adjusting your filters</p></div>
          ) : (
            <div className="table-wrapper card" style={{ padding:0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title / Name</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => (
                    <tr key={c._id} style={{ cursor:"pointer" }} onClick={() => { setSelected(c); setAiResult(null); }}>
                      <td>
                        <strong>{c.title}</strong>
                        <div style={{ fontSize:"0.78rem", color:"var(--text-muted)" }}>{c.name} · {c.email}</div>
                      </td>
                      <td><span className="badge badge-medium">{c.category}</span></td>
                      <td>{c.location}</td>
                      <td><span className={`badge ${STATUS_BADGE[c.status]}`}>{c.status}</span></td>
                      <td>
                        {c.aiAnalysis?.priority
                          ? <span className={`badge ${PRIORITY_BADGE[c.aiAnalysis.priority]}`}>{c.aiAnalysis.priority}</span>
                          : <span style={{ color:"var(--text-muted)", fontSize:"0.78rem" }}>—</span>}
                      </td>
                      <td style={{ whiteSpace:"nowrap" }}>{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <div style={{ display:"flex", gap:"0.4rem" }}>
                          <button className="btn btn-ghost btn-sm" title="View" onClick={() => { setSelected(c); setAiResult(null); }}><Eye size={14} /></button>
                          <button className="btn btn-ghost btn-sm" title="Analyze" onClick={() => { setSelected(c); setAiResult(null); handleAiAnalyze(c); }}><Cpu size={14} /></button>
                          {isAdmin && (
                            <button className="btn btn-danger btn-sm" title="Delete" onClick={() => handleDelete(c._id)}><Trash2 size={14} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selected && (
          <div>
            <div className="card" style={{ position:"sticky", top:"80px" }}>
              <div className="card-header">
                <div><div className="card-title">{selected.title}</div><div className="card-subtitle">#{selected._id.slice(-8)}</div></div>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem", marginBottom:"1rem" }}>
                {[["Name", selected.name],["Email", selected.email],["Category", selected.category],["Location", selected.location]].map(([l,v]) => (
                  <div key={l} style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ color:"var(--text-muted)", fontSize:"0.82rem" }}>{l}</span>
                    <span style={{ fontWeight:600, fontSize:"0.88rem" }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ color:"var(--text-muted)", fontSize:"0.82rem" }}>Status</span>
                  {isAdmin ? (
                    <select className="form-control" style={{ width:"auto", padding:"0.3rem 0.6rem" }} value={selected.status}
                      onChange={e => handleStatusUpdate(selected._id, e.target.value)}>
                      {["Pending","In Progress","Resolved","Rejected"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  ) : <span className={`badge ${STATUS_BADGE[selected.status]}`}>{selected.status}</span>}
                </div>
              </div>
              <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", padding:"0.9rem", fontSize:"0.88rem", color:"var(--text-secondary)", marginBottom:"1rem" }}>
                {selected.description}
              </div>
              <button className="btn btn-primary" style={{ width:"100%" }} onClick={() => handleAiAnalyze(selected)} disabled={aiLoading}>
                <Cpu size={15} /> {aiLoading ? "Analyzing..." : "Run AI Analysis"}
              </button>
              {aiResult && (
                <div className="ai-panel" style={{ marginTop:"1rem" }}>
                  <div className="ai-panel-header"><Cpu size={16} /> AI Analysis</div>
                  <div className="ai-grid" style={{ marginBottom:"0.75rem" }}>
                    <div className="ai-item"><label>Priority</label><span className={`badge ${PRIORITY_BADGE[aiResult.priority]}`}>{aiResult.priority}</span></div>
                    <div className="ai-item"><label>Department</label><p style={{ fontSize:"0.82rem" }}>{aiResult.department}</p></div>
                  </div>
                  <div className="ai-item" style={{ marginBottom:"0.75rem" }}><label>Summary</label><p style={{ fontSize:"0.85rem" }}>{aiResult.summary}</p></div>
                  <div><label style={{ fontSize:"0.72rem", color:"var(--text-muted)", textTransform:"uppercase" }}>Auto Response</label><div className="ai-response" style={{ fontSize:"0.82rem" }}>{aiResult.autoResponse}</div></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintList;
