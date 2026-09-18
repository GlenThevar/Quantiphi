# Quantiphi Chat 🤖

An intelligent AI chat assistant with real-time streaming responses, JWT authentication, conversation history, and tone control — built with React, Express, and MongoDB.


<img width="1432" height="810" alt="Screenshot 2026-09-18 at 10 14 31 AM" src="https://github.com/user-attachments/assets/bd1f2092-44d8-42d8-b313-efbac4bf6c2a" />
<img width="1434" height="814" alt="Screenshot 2026-09-18 at 10 14 54 AM" src="https://github.com/user-attachments/assets/9611dfcf-c8ea-4e27-ba4b-717a29652e8d" />
<img width="1435" height="810" alt="Screenshot 2026-09-18 at 10 15 13 AM" src="https://github.com/user-attachments/assets/06bb6657-8e4a-4c92-983c-5f4af40bc5b7" />


---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Express.js + Node.js (ESM) |
| Database | MongoDB Atlas via Mongoose |
| AI | Qwen 3.8B-27B via OpenRouter (`qwen/qwen3.8-27b:free`) |
| Auth | JWT (Bearer token, 7-day expiry) |
| Streaming | Server-Sent Events (SSE) over `fetch` + `ReadableStream` |

---

## Features

- 🔐 **JWT Authentication** — Register and login with email + password (bcrypt-hashed)
- 💬 **Real-time Streaming** — AI responses stream token-by-token with a blinking cursor
- 🗂 **Conversation Threads** — ChatGPT-style sidebar; each chat is a separate thread persisted in MongoDB
- 🎭 **Tone Toggle** — Switch between **Professional**, **Casual**, and **Concise** per conversation; applied as a system prompt modifier
- 🌙 **Dark / Light Theme** — Toggle in the sidebar footer; preference saved to `localStorage`
- 📝 **Markdown Rendering** — AI responses render code blocks, tables, lists, bold, and blockquotes
- 📱 **Collapsible Sidebar** — Collapse to icon-only mode for more screen space
- 🗑️ **Delete Threads** — Hover a conversation to reveal the delete button
- ⌨️ **Auto-resize Input** — Textarea grows as you type; `Shift+Enter` for new line, `Enter` to send
- 🔒 **Auth Guards** — Protected routes redirect unauthenticated users to login

---

## Project Structure

```
Quantiphi/
├── client/                        # React + Vite frontend (port 5173)
│   ├── src/
│   │   ├── api/                   # Axios instance + API helpers
│   │   │   ├── axios.js           # JWT interceptor + global 401 handler
│   │   │   ├── auth.js
│   │   │   └── conversations.js
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   ├── ChatWindow.jsx  # Message list, input bar, streaming bubble
│   │   │   │   └── MessageBubble.jsx # User/AI bubbles with Markdown
│   │   │   ├── sidebar/
│   │   │   │   └── ConversationList.jsx # Thread list, new chat, delete
│   │   │   └── ui/
│   │   │       ├── ToneToggle.jsx  # Professional / Casual / Concise pills
│   │   │       └── ThemeToggle.jsx # Sun/Moon icon
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # JWT + user state
│   │   │   ├── ThemeContext.jsx   # Dark/light toggle
│   │   │   └── ChatContext.jsx    # Conversations + streaming state
│   │   ├── hooks/
│   │   │   └── useStream.js       # SSE stream reader hook
│   │   └── pages/
│   │       ├── LoginPage.jsx
│   │       ├── RegisterPage.jsx
│   │       └── ChatPage.jsx
│   ├── index.html
│   ├── vite.config.js             # Proxy /api → localhost:5000
│   ├── tailwind.config.js
│   └── package.json
│
└── server/                        # Express + Node.js backend (port 5000)
    ├── src/
    │   ├── app.js                 # Express entry point, CORS, routes
    │   ├── config/db.js           # MongoDB Atlas connection
    │   ├── models/
    │   │   ├── User.js            # email + bcrypt password hash
    │   │   └── Conversation.js    # Thread + embedded messages[] + tone
    │   ├── middleware/
    │   │   └── authMiddleware.js  # JWT Bearer verify → req.user
    │   ├── controllers/
    │   │   ├── authController.js         # register / login / me
    │   │   ├── chatController.js         # SSE streaming + save to DB
    │   │   └── conversationController.js # CRUD + tone update
    │   └── routes/
    │       ├── auth.js
    │       ├── chat.js
    │       └── conversations.js
    ├── .env                       # Credentials (gitignored)
    ├── .env.example               # Template
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### 1. Clone and Install

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment

The `server/.env` file is pre-configured. If you need to reset it, copy the example:

```bash
cp server/.env.example server/.env
```

Required variables:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_strong_random_secret
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
MODEL_ID=qwen/qwen3.8-27b:free
```

### 3. Run the App

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```
> Starts on `http://localhost:5000`  
> You should see: `🚀 Server running` and `✅ MongoDB Connected`

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```
> Starts on `http://localhost:5173`

### 4. Open and Register

Visit **[http://localhost:5173](http://localhost:5173)**, create an account, and start chatting!

---

## How Streaming Works

```
Browser (fetch + ReadableStream)
    │
    │  POST /api/chat/stream  { conversationId, prompt }
    ▼
Express (authMiddleware → chatController)
    ├── Build system prompt from conversation tone
    ├── Load last 20 messages as context
    ├── Call OpenRouter (qwen/qwen3.8-27b:free) with stream: true
    ├── Set headers: Content-Type: text/event-stream
    ├── Pipe each token → res.write(`data: {"content":"..."}\n\n`)
    └── On finish → save full message pair to MongoDB
```

---

## Tone System

Each conversation stores a `tone` field. When a message is sent, the backend selects the matching system prompt:

| Tone | System Prompt Behaviour |
|---|---|
| **Professional** | Formal, precise, structured clarity |
| **Casual** | Warm, conversational, like a knowledgeable friend |
| **Concise** | Brief, direct, no filler — straight to the point |

The tone can be changed at any point mid-conversation using the pill buttons in the chat header.

---

## API Reference

All endpoints under `/api/`. Protected routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login, returns JWT |
| `GET` | `/api/auth/me` | ✅ | Get current user |
| `GET` | `/api/conversations` | ✅ | List all threads (sidebar) |
| `POST` | `/api/conversations` | ✅ | Create new thread |
| `GET` | `/api/conversations/:id` | ✅ | Load thread with all messages |
| `DELETE` | `/api/conversations/:id` | ✅ | Delete thread |
| `PATCH` | `/api/conversations/:id/tone` | ✅ | Update tone |
| `POST` | `/api/chat/stream` | ✅ | Stream AI response (SSE) |

---

## Data Models

### User
```json
{
  "_id": "ObjectId",
  "email": "string",
  "password": "bcrypt hash",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Conversation
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: User)",
  "title": "string (auto-generated from first message)",
  "tone": "Professional | Casual | Concise",
  "messages": [
    { "role": "user | assistant", "content": "string", "timestamp": "Date" }
  ],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## Scripts

| Directory | Command | Description |
|---|---|---|
| `server/` | `npm run dev` | Start backend with nodemon (hot reload) |
| `server/` | `npm start` | Start backend (production) |
| `client/` | `npm run dev` | Start Vite dev server |
| `client/` | `npm run build` | Build for production |
| `client/` | `npm run preview` | Preview production build |
