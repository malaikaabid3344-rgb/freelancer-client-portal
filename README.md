# Freelancer Client Portal

A full-stack SaaS-style platform for freelancers to manage clients, projects, files, invoices,
tasks, messages, time tracking, and reports from one dashboard.

**Stack:** React + Vite + TypeScript + Tailwind (frontend) · Node.js + Express + MongoDB (backend) · JWT auth

---

## Project Structure

```
freelancer-portal/
├── client/          # React + Vite + TypeScript frontend
│   └── src/
│       ├── components/   # Reusable UI kit + layout + form modals
│       ├── pages/         # One file per route
│       ├── layouts/       # DashboardLayout, AuthLayout
│       ├── context/       # Auth + Toast providers
│       ├── services/      # Axios calls, one module per resource
│       ├── routes/        # ProtectedRoute
│       ├── types/         # Shared TypeScript interfaces
│       └── utils/         # formatCurrency, formatDate, etc.
└── server/          # Node.js + Express + MongoDB backend
    ├── models/       # Mongoose schemas
    ├── controllers/  # Route handlers
    ├── routes/       # Express routers
    ├── middleware/   # auth (JWT), upload (multer), error handling
    ├── seed/         # Demo data seed script
    └── server.js     # Entry point
```

---

## Setup Instructions

### 1. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure environment variables

```bash
# In /server
cp .env.example .env
# Edit .env if needed — defaults work for a local MongoDB instance

# In /client
cp .env.example .env
# Default VITE_API_URL=http://localhost:5000/api works out of the box
```

### 3. Start MongoDB

Make sure MongoDB is running locally (or point `MONGO_URI` in `server/.env` at your own instance,
e.g. a MongoDB Atlas connection string).

```bash
# Example for a local install:
mongod --dbpath /path/to/your/data/directory
```

### 4. Seed the database

This wipes existing data and creates a demo user, 6 clients, 6 projects, tasks, invoices,
messages, and time entries.

```bash
cd server
npm run seed
```

### 5. Start the backend

```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

### 6. Start the frontend

```bash
cd client
npm run dev
# App runs on http://localhost:5173
```

### 7. Demo login credentials

```
Email:    john@freelancerportal.com
Password: Demo@1234
```

---

## Notes

- **File uploads** are stored locally in `server/uploads/` in development. The controller
  (`server/controllers/fileController.js`) is written as a thin abstraction — swapping in
  S3/Cloudinary later only requires changing `middleware/upload.js` and the file paths
  returned by the controller; no route or frontend changes are needed.
- **Security**: passwords are hashed with bcrypt, all resource routes are protected by JWT
  middleware, and every query is scoped to `req.user._id` so users can only ever see their
  own data.
- **Charts** use Recharts and are fed by real aggregation queries on the backend
  (`server/controllers/reportController.js`) for the Reports page, and by client-side
  aggregation of already-fetched data for the Dashboard.
- If port `5000` or `5173` are already in use on your machine, change `PORT` in
  `server/.env` and/or the `server.port` in `client/vite.config.ts` (update `VITE_API_URL`
  to match).
