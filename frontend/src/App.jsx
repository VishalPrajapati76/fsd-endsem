import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import RegisterComplaint from "./pages/RegisterComplaint";
import ComplaintList from "./pages/ComplaintList";
import AIAnalyzer from "./pages/AIAnalyzer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./index.css";

// Protected route wrapper — only accessible when logged in
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" style={{ height: "100vh" }} />;
  return user ? children : <Navigate to="/login" replace />;
};

// Layout with Navbar for authenticated/main pages
const MainLayout = ({ children }) => (
  <>
    <Navbar />
    <div className="main-content">{children}</div>
  </>
);

const AppRoutes = () => {
  const { loading } = useAuth();
  if (loading) return <div className="spinner" style={{ height: "100vh" }} />;

  return (
    <Routes>
      {/* Public auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Main app pages (public — complaints visible without login) */}
      <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
      <Route path="/register-complaint" element={<MainLayout><RegisterComplaint /></MainLayout>} />
      <Route path="/complaints" element={<MainLayout><ComplaintList /></MainLayout>} />
      <Route path="/ai-analyze" element={<MainLayout><AIAnalyzer /></MainLayout>} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <Router>
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            fontSize: "0.875rem",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "white" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "white" } },
        }}
      />
      <AppRoutes />
    </AuthProvider>
  </Router>
);

export default App;
