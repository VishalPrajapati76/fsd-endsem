import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { ShieldCheck, Eye, EyeOff, UserPlus } from "lucide-react";

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
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
    if (!form.name || !form.email || !form.password) { setError("All fields are required"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      const { data } = await registerUser({ name: form.name, email: form.email, password: form.password });
      login(data.user, data.token);
      toast.success(`Welcome, ${data.user.name}! Account created.`);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Strong"];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#10b981"];

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <ShieldCheck size={40} style={{ color: "var(--accent-purple)", marginBottom: "0.5rem" }} />
          <h1>Create Account</h1>
          <p>Join the SmartComplaint AI system</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="form-control" placeholder="Rahul Kumar" autoComplete="name" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="form-control" placeholder="rahul@gmail.com" autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  name="password" type={showPass ? "text" : "password"}
                  value={form.password} onChange={handleChange}
                  className="form-control" placeholder="Min. 6 characters"
                  style={{ paddingRight: "2.8rem" }}
                />
                <button type="button" className="btn btn-ghost"
                  style={{ position: "absolute", right: "4px", top: "50%", transform: "translateY(-50%)", padding: "0.3rem" }}
                  onClick={() => setShowPass((p) => !p)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop: "6px", display: "flex", gap: "4px", alignItems: "center" }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{ height: "4px", flex: 1, borderRadius: "2px", background: i <= strength ? strengthColor[strength] : "var(--border)", transition: "background 0.3s" }} />
                  ))}
                  <span style={{ fontSize: "0.72rem", color: strengthColor[strength], marginLeft: "6px", minWidth: "36px" }}>{strengthLabel[strength]}</span>
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                name="confirmPassword" type="password" value={form.confirmPassword}
                onChange={handleChange} className="form-control" placeholder="Repeat password"
              />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="form-error">Passwords do not match</p>
              )}
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={loading}>
              <UserPlus size={16} /> {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
