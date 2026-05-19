import React, { useEffect, useState } from "react";
import { getAllComplaints } from "../services/api";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Clock, CheckCircle, XCircle, Cpu, PlusCircle, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAllComplaints({ limit: 100 })
      .then(({ data }) => setComplaints(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "Pending").length,
    inProgress: complaints.filter(c => c.status === "In Progress").length,
    resolved: complaints.filter(c => c.status === "Resolved").length,
    rejected: complaints.filter(c => c.status === "Rejected").length,
    withAI: complaints.filter(c => c.aiAnalysis?.priority).length,
    critical: complaints.filter(c => c.aiAnalysis?.priority === "Critical").length,
    high: complaints.filter(c => c.aiAnalysis?.priority === "High").length,
  };

  const recent = complaints.slice(0, 5);

  const STATUS_BADGE = { Pending:"badge-pending","In Progress":"badge-progress", Resolved:"badge-resolved", Rejected:"badge-rejected" };

  return (
    <div>
      <div className="page-header" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of all complaints and AI insights</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/register-complaint")}>
          <PlusCircle size={16} /> New Complaint
        </button>
      </div>

      {loading ? <div className="spinner" /> : (
        <>
          <div className="stats-grid">
            {[
              { label:"Total Complaints", value:stats.total, icon:<ClipboardList size={22} />, color:"#3b82f6", bg:"rgba(59,130,246,0.15)" },
              { label:"Pending", value:stats.pending, icon:<Clock size={22} />, color:"#f59e0b", bg:"rgba(245,158,11,0.15)" },
              { label:"In Progress", value:stats.inProgress, icon:<TrendingUp size={22} />, color:"#06b6d4", bg:"rgba(6,182,212,0.15)" },
              { label:"Resolved", value:stats.resolved, icon:<CheckCircle size={22} />, color:"#10b981", bg:"rgba(16,185,129,0.15)" },
              { label:"Rejected", value:stats.rejected, icon:<XCircle size={22} />, color:"#ef4444", bg:"rgba(239,68,68,0.15)" },
              { label:"AI Analyzed", value:stats.withAI, icon:<Cpu size={22} />, color:"#8b5cf6", bg:"rgba(139,92,246,0.15)" },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{ background:s.bg }}>
                  <span style={{ color:s.color }}>{s.icon}</span>
                </div>
                <div>
                  <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {stats.critical > 0 && (
            <div className="alert alert-error" style={{ marginBottom:"1.5rem" }}>
              🚨 <strong>{stats.critical} Critical</strong> complaint(s) require immediate attention!
              <button className="btn btn-danger btn-sm" style={{ marginLeft:"auto" }} onClick={() => navigate("/complaints")}>View Now</button>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <div className="card-title">Recent Complaints</div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate("/complaints")}>View All</button>
            </div>
            {recent.length === 0 ? (
              <div className="empty-state">
                <ClipboardList size={40} />
                <h3>No complaints yet</h3>
                <p>Register the first complaint to get started</p>
                <button className="btn btn-primary" style={{ marginTop:"1rem" }} onClick={() => navigate("/register-complaint")}>Register Complaint</button>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Title</th><th>Name</th><th>Category</th><th>Status</th><th>Priority</th><th>Date</th></tr></thead>
                  <tbody>
                    {recent.map(c => (
                      <tr key={c._id} style={{ cursor:"pointer" }} onClick={() => navigate("/complaints")}>
                        <td><strong>{c.title}</strong></td>
                        <td>{c.name}</td>
                        <td>{c.category}</td>
                        <td><span className={`badge ${STATUS_BADGE[c.status]}`}>{c.status}</span></td>
                        <td>{c.aiAnalysis?.priority
                          ? <span className={`badge ${{Critical:"badge-critical",High:"badge-high",Medium:"badge-medium",Low:"badge-low"}[c.aiAnalysis.priority]}`}>{c.aiAnalysis.priority}</span>
                          : <span style={{ color:"var(--text-muted)",fontSize:"0.78rem" }}>Not analyzed</span>}</td>
                        <td>{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
