import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { ShieldCheck, Eye, EyeOff, LogIn } from "lucide-react";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Email and password are required"); return; }
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <ShieldCheck size={40} style={{ color: "var(--accent-blue)", marginBottom: "0.5rem" }} />
          <h1>SmartComplaint AI</h1>
          <p>Sign in to your account</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                name="email" type="email" value={form.email}
                onChange={handleChange} className="form-control"
                placeholder="you@example.com" autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  name="password" type={showPass ? "text" : "password"}
                  value={form.password} onChange={handleChange}
                  className="form-control" placeholder="••••••••"
                  style={{ paddingRight: "2.8rem" }} autoComplete="current-password"
                />
                <button type="button" className="btn btn-ghost"
                  style={{ position: "absolute", right: "4px", top: "50%", transform: "translateY(-50%)", padding: "0.3rem" }}
                  onClick={() => setShowPass((p) => !p)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="divider">or try demo</div>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <button type="button" className="btn btn-secondary btn-sm" style={{ flex: 1 }}
                onClick={() => setForm({ email: "admin@complaint.com", password: "admin123" })}>
                Admin Demo
              </button>
              <button type="button" className="btn btn-secondary btn-sm" style={{ flex: 1 }}
                onClick={() => setForm({ email: "user@complaint.com", password: "user1234" })}>
                User Demo
              </button>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={loading}>
              <LogIn size={16} /> {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
