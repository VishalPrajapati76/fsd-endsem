import axios from "axios";

// Base URL from environment variable
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — clear token and redirect
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

// ─── Complaint APIs ───────────────────────────────────────
export const addComplaint = (data) => API.post("/complaints", data);
export const getAllComplaints = (params) => API.get("/complaints", { params });
export const getComplaintById = (id) => API.get(`/complaints/${id}`);
export const updateComplaintStatus = (id, status) => API.put(`/complaints/${id}`, { status });
export const deleteComplaint = (id) => API.delete(`/complaints/${id}`);
export const searchByLocation = (location) =>
  API.get("/complaints/search", { params: { location } });

// ─── Auth APIs ────────────────────────────────────────────
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");

// ─── AI APIs ─────────────────────────────────────────────
export const analyzeComplaint = (data) => API.post("/ai/analyze", data);
export const getComplaintAnalysis = (id) => API.get(`/ai/analysis/${id}`);

export default API;
