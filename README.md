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
- `GET  /topics`         - list topics (public)
- `POST /topics`         - create topic (auth required)
- `GET  /questions`      - list questions by topic/difficulty
- `POST /questions`      - create question for a topic (auth required)
- `POST /sessions/next-question` - get next question for a topic (auth required)
- `POST /attempts`       - log an answer attempt (auth required)
- `GET  /attempts/recent`- recent attempts (auth required)
- `POST /emotion-events` - send an emotion label/confidence (auth required)
- `GET  /emotion-events/recent` - recent emotion labels (auth required)
- `GET  /emotion-events/current` - latest smoothed label (auth required)

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

## 7) Adaptive alpha (what was built here)
- **Backend**: Mongoose models + routes for topics, questions, attempts, emotion_events, and a rule-based `/sessions/next-question` sampler that nudges difficulty using recent accuracy + latest emotion label.
- **Frontend**: `/learn` page that pulls topics, fetches the next question, logs attempts (with response time), and lets you send manual emotion labels for now. The dashboard links to it.
- **Emotion sensing (alpha)**: client-side webcam sensing via `face-api.js` with consent toggle on `/learn`. Only labels/confidence are POSTed, throttled every few seconds. Override `NEXT_PUBLIC_FACE_MODELS_BASE` if you self-host model weights.

### Seeding a topic + question quickly
1) Create a topic (use your cookie auth):
```bash
curl -X POST http://localhost:8080/topics \
  -H "Content-Type: application/json" \
  --cookie "cognivize_token=YOURTOKEN" \
  -d '{ "title": "Algebra Basics", "slug": "algebra-basics" }'
```
2) Create a question for that topic:
```bash
curl -X POST http://localhost:8080/questions \
  -H "Content-Type: application/json" \
  --cookie "cognivize_token=YOURTOKEN" \
  -d '{
    "topic_id": "TOPIC_ID",
    "prompt": "What is the value of x in 2x + 3 = 7?",
    "difficulty": 2,
    "choices": [
      { "id": "a", "text": "x = 1", "is_correct": false },
      { "id": "b", "text": "x = 2", "is_correct": true },
      { "id": "c", "text": "x = 3", "is_correct": false }
    ]
  }'
```
3) Visit `http://localhost:3000/learn` while logged in to pull questions, answer, and send emotion labels.
