# Cognivize Auth Starter (Next.js + Node/Express + MongoDB)

This is a **free, local-first starter** for your project:
- **Frontend:** Next.js (App Router) + Tailwind
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Auth:** Register/Login with **JWT**, **bcrypt** password hashing, and basic validation

> Note: This starter focuses on the **foundation** (auth + clean structure). You can extend it with quizzes, RL, emotion events, etc.

---

## 1) Prerequisites
- Node.js 18+ (recommended 20+)
- npm 9+
- MongoDB running locally (e.g., `mongodb://localhost:27017`)

---

## 2) Project structure
- `apps/web`  - Next.js frontend
- `apps/api`  - Express backend

---

## 3) Run locally (with your MongoDB instance running)

Ensure MongoDB is running locally. Update `apps/api/.env` with your connection string (defaults to `mongodb://localhost:27017` and DB name `cognivize`).

### A) Create database indexes
```bash
cd ../apps/api
cp .env.example .env
npm install
npm run db:setup
```

### B) Start backend
```bash
npm run dev
```
Backend runs on: `http://localhost:8080`

### C) Start frontend
In a new terminal:
```bash
cd ../web
cp .env.local.example .env.local
npm install
npm run dev
```
Frontend runs on: `http://localhost:3000`

---

## 4) API routes
- `POST /auth/register`  - { name, email, password }
- `POST /auth/login`     - { email, password }
- `GET  /me`             - uses httpOnly cookie (`cognivize_token`)

---

## 5) Production notes (important)
- Use HTTPS in production.
- Put MongoDB behind private networking when possible.
- Store JWT secret securely.
- Add refresh tokens + rate limiting + email verification for a real system.

---

## 6) Next steps to extend Cognivize
- Add `topics`, `questions`, `attempts`, `emotion_events`
- Add adaptive policy:
  - start rule-based, then implement Q-learning module server-side
- Add engagement detection client-side and send only labels/confidence (no frames)
