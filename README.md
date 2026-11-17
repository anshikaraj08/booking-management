<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Aetheria Heights — Booking Management System

A luxury hospitality management suite with guest and admin portals and an AI concierge.

## Project structure

```
booking-management/
├── backend/                     # Express + MongoDB REST API
│   ├── src/
│   │   ├── config/              # env loading, DB connection, mail transporter
│   │   ├── models/              # Mongoose schemas (User, Room, Hall, Booking, ...)
│   │   ├── controllers/         # Request handlers (business logic per resource)
│   │   ├── routes/              # Express routers, mounted under /api
│   │   ├── middleware/          # auth (JWT, admin), error handling
│   │   ├── services/            # Reusable logic (email, Gemini AI concierge)
│   │   ├── templates/           # HTML email templates
│   │   ├── app.js               # Express app setup (middleware + routes)
│   │   └── server.js            # Entry point: connect DB, start server
│   ├── .env.example
│   └── package.json
│
├── frontend/                    # React + Vite client
│   ├── src/
│   │   ├── components/          # AdminPortal, CustomerPortal, Auth, Chatbot
│   │   ├── services/            # API clients (chat concierge)
│   │   ├── App.jsx
│   │   ├── main.jsx             # React entry point
│   │   └── types.js             # JSDoc type definitions
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
└── render.yaml                  # Render deployment (backend + frontend)
```

## Run locally

**Prerequisites:** Node.js, MongoDB

### Backend

```bash
cd backend
npm install
cp .env.example .env    # fill in values, incl. GEMINI_API_KEY
npm run dev             # http://localhost:3001
```

**Email setup (newsletter):** set `EMAIL_USER` to your Gmail address and `EMAIL_PASS` to an App Password
(Google Account → Security → 2-Step Verification → App passwords → generate one for "Mail").

### Frontend

```bash
cd frontend
npm install
cp .env.example .env    # set VITE_API_URL
npm run dev             # http://localhost:3000
```
