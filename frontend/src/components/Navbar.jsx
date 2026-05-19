import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, LogOut, User, LayoutDashboard, PlusCircle, List, Cpu } from "lucide-react";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        <ShieldCheck size={22} />
        SmartComplaint AI
      </NavLink>

      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>
          <LayoutDashboard size={15} style={{ marginRight: 4, verticalAlign: "middle" }} />
          Dashboard
        </NavLink>
        <NavLink to="/register-complaint" className={({ isActive }) => isActive ? "active" : ""}>
          <PlusCircle size={15} style={{ marginRight: 4, verticalAlign: "middle" }} />
          New Complaint
        </NavLink>
        <NavLink to="/complaints" className={({ isActive }) => isActive ? "active" : ""}>
          <List size={15} style={{ marginRight: 4, verticalAlign: "middle" }} />
          All Complaints
        </NavLink>
        <NavLink to="/ai-analyze" className={({ isActive }) => isActive ? "active" : ""}>
          <Cpu size={15} style={{ marginRight: 4, verticalAlign: "middle" }} />
          AI Analyzer
        </NavLink>
      </div>

      <div className="navbar-actions">
        {user ? (
          <>
            <div className="user-badge">
              <span className="dot" />
              <User size={13} />
              {user.name} {isAdmin && <span style={{ color: "var(--accent-purple)", fontSize: "0.7rem" }}>ADMIN</span>}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              <LogOut size={14} /> Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="btn btn-secondary btn-sm">Login</NavLink>
            <NavLink to="/signup" className="btn btn-primary btn-sm">Sign Up</NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
