# 🚀 TaskFlow — Team Task Management App

A full-stack Team Task Management Web Application (like Trello/Asana) built with **React.js**, **Node.js**, **Express.js**, and **MongoDB**.

---

## ✨ Features

### Authentication
- JWT-based signup/login
- Password hashing with bcrypt
- Protected routes with middleware

### Project Management
- Create projects (Admin only)
- Add/remove members (Admin only)
- View all projects user belongs to

### Task Management (Kanban Board)
- Create tasks with title, description, due date, priority
- Assign tasks to team members
- Update status: **To Do** → **In Progress** → **Done**
- Search & filter tasks

### Dashboard
- Total tasks overview
- Tasks by status breakdown
- Overdue task counter
- Tasks per team member (Admin)

### Role-Based Access
- **Admin**: Full CRUD on projects & tasks, manage members
- **Member**: View & update only assigned tasks

---

## 📁 Folder Structure

```
A Team Task Manager/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   └── taskRoutes.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedLayout.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Projects.jsx
│   │   │   └── ProjectDetails.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── .env
├── .gitignore
└── README.md
```

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/team-task-manager.git
cd "A Team Task Manager"
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/team-task-manager
JWT_SECRET=your_jwt_secret_here
```

Start the backend:
```bash
npm start
```

### 3. Setup Frontend
```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

### 4. Open in Browser
Visit `http://localhost:5173`

---

## 🚀 Deployment (Railway)

### Backend
1. Push the `backend` folder to a GitHub repo
2. Connect to Railway → New Project → Deploy from GitHub
3. Add env variables: `MONGODB_URI`, `JWT_SECRET`, `PORT`
4. Railway will auto-detect Node.js and run `npm start`

### Frontend
1. Build the frontend: `npm run build`
2. Deploy the `dist/` folder to Railway (or Vercel/Netlify)
3. Set `VITE_API_URL` to your deployed backend URL

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register a new user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | JWT | Get current user |
| GET | `/api/auth/users` | JWT | List all users |
| GET | `/api/projects` | JWT | Get user's projects |
| POST | `/api/projects` | JWT+Admin | Create project |
| GET | `/api/projects/:id` | JWT | Get project details |
| PUT | `/api/projects/:id/members/add` | JWT+Admin | Add member |
| PUT | `/api/projects/:id/members/remove` | JWT+Admin | Remove member |
| GET | `/api/tasks` | JWT | Get tasks (filter by project, status, etc.) |
| POST | `/api/tasks` | JWT+Admin | Create task |
| PUT | `/api/tasks/:id` | JWT | Update task |
| DELETE | `/api/tasks/:id` | JWT+Admin | Delete task |
| GET | `/api/tasks/stats` | JWT | Dashboard statistics |

---

## 🧑‍💻 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |

---

## 📝 License

MIT
