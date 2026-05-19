# AI-Based Smart Complaint Management System

A full-stack **MERN** application that allows users to register complaints online. It uses **AI APIs** (OpenRouter) to classify complaint priority, generate automated responses, recommend the concerned department, and summarize complaints.

## 🔗 Live URLs

| Service | URL |
|---|---|
| Frontend | `https://complaint-management-frontend.onrender.com` |
| Backend API | `https://complaint-management-backend.onrender.com` |

---

## 📁 Project Structure

```
fsd-final/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, GetMe
│   │   ├── complaintController.js # CRUD + Search + AI Save
│   │   └── aiController.js        # OpenRouter AI Analysis
│   ├── middlewares/
│   │   ├── authMiddleware.js      # JWT protect + adminOnly
│   │   ├── errorMiddleware.js     # Global error handler + 404
│   │   └── validationMiddleware.js# express-validator rules
│   ├── models/
│   │   ├── Complaint.js           # Complaint schema + AI fields
│   │   └── User.js                # User schema + bcrypt hook
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth/*
│   │   ├── complaintRoutes.js     # /api/complaints/*
│   │   └── aiRoutes.js            # /api/ai/*
│   ├── .env                       # Environment variables
│   ├── package.json
│   └── server.js                  # Express entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global auth state
    │   ├── pages/
    │   │   ├── Dashboard.jsx      # Stats + recent complaints
    │   │   ├── RegisterComplaint.jsx
    │   │   ├── ComplaintList.jsx  # List + filter + search
    │   │   ├── AIAnalyzer.jsx     # Standalone AI analysis
    │   │   ├── Login.jsx
    │   │   └── Signup.jsx
    │   ├── services/
    │   │   └── api.js             # Axios instance + all endpoints
    │   ├── App.jsx                # Router + layout
    │   ├── main.jsx
    │   └── index.css              # Global dark-theme styles
    ├── .env
    └── index.html
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/complaintDB
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=sk-or-v1-...
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Running Locally

```bash
# Backend
cd backend
npm install
npm run dev     # Runs on http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev     # Runs on http://localhost:5173
```

---

## 📡 API Endpoints

### Auth APIs
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register user | Public |
| POST | `/api/auth/login` | Login & get token | Public |
| GET  | `/api/auth/me` | Get profile | 🔒 JWT |

### Complaint APIs
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/complaints` | Add complaint | Public |
| GET | `/api/complaints` | Get all (filter by category/status) | Public |
| GET | `/api/complaints/search?location=X` | Search by location | Public |
| GET | `/api/complaints/:id` | Get single complaint | Public |
| PUT | `/api/complaints/:id` | Update status | 🔒 Admin |
| DELETE | `/api/complaints/:id` | Delete complaint | 🔒 Admin |

### AI APIs
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/analyze` | Analyze complaint with AI |
| GET | `/api/ai/analysis/:id` | Get stored AI analysis |

---

## 🤖 AI Features

- **Priority Detection** — Critical / High / Medium / Low
- **Department Recommendation** — Maps category to responsible govt. department
- **Complaint Summary** — Concise 1-2 sentence AI-generated summary
- **Auto Response** — Professional automated reply for the complainant
- **Rule-based Fallback** — Works even without API key using keyword matching

---

## 🔐 Security

- **JWT Authentication** — 7-day tokens, verified on each protected request
- **bcrypt Password Hashing** — Salt rounds: 10
- **Protected Routes** — Admin-only status update and delete
- **Input Validation** — express-validator on all POST/PUT endpoints
- **Global Error Handler** — Consistent error format, no stack traces in production

---

## 🧪 Sample API Requests (Postman)

**Add Complaint:**
```json
POST /api/complaints
{
  "name": "Rahul Kumar",
  "email": "rahul@gmail.com",
  "title": "Water Leakage Issue",
  "description": "Water pipeline damaged near market area causing flooding.",
  "category": "Water Supply",
  "location": "Ghaziabad"
}
```

**AI Analyze:**
```json
POST /api/ai/analyze
{
  "title": "Street Light Not Working",
  "description": "All street lights on Main Road are broken for 3 days causing accidents at night.",
  "category": "Electricity",
  "location": "Delhi"
}
```

**Login:**
```json
POST /api/auth/login
{
  "email": "admin@complaint.com",
  "password": "admin123"
}
```

---

## 🚢 Deployment on Render

### Backend
1. Create **Web Service** → Connect GitHub repo
2. Root: `backend/`, Build: `npm install`, Start: `node server.js`
3. Add environment variables from `.env`

### Frontend
1. Create **Static Site** → Connect same repo
2. Root: `frontend/`, Build: `npm run build`, Publish: `dist`
3. Set `VITE_API_URL` to your backend Render URL

---

## 👨‍💻 Author

**Vishal Prajapati** — B.Tech 4th Semester  
AI Driven Full Stack Development (AI308B)  
ESE Examination — Even Semester 2025-26
