# Codebase Architecture

A technical deep-dive into the portfolio application's codebase, design patterns, and data flow.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                  │
│  index.html + script.js + styles.css                 │
│  ┌──────────┐ ┌──────────┐ ┌───────────────────┐    │
│  │ Chatbot  │ │ Contact  │ │ Resume Builder    │    │
│  │ Widget   │ │ Form     │ │ (Admin only)      │    │
│  └────┬─────┘ └────┬─────┘ └────────┬──────────┘    │
└───────┼─────────────┼────────────────┼───────────────┘
        │             │                │
   POST /api/chat  POST /api/contact  POST /api/tailor-resume
        │             │                │
┌───────┼─────────────┼────────────────┼───────────────┐
│       ▼             ▼                ▼               │
│  ┌─────────────────────────────────────────────┐     │
│  │              EXPRESS SERVER                  │     │
│  │  server.js → middleware stack → routes       │     │
│  └─────────────────────────────────────────────┘     │
│       │             │                │               │
│  ┌────▼───┐   ┌─────▼────┐   ┌──────▼──────┐        │
│  │ Groq   │   │ Gmail    │   │ Groq API +  │        │
│  │ API    │   │ SMTP     │   │ PDFKit      │        │
│  └────────┘   └──────────┘   └─────────────┘        │
└──────────────────────────────────────────────────────┘
```

---

## Backend Modules

### `server.js` — Entry Point

- Creates Express app
- Applies middleware stack in order: security → logging → body parsing → static files
- Mounts route modules
- Attaches error handlers
- Starts HTTP server with graceful shutdown

### `config/index.js` — Configuration

- Loads `.env` via `dotenv`
- Validates required variables (`GROQ_API_KEY`)
- Exports typed config object with defaults
- All other modules import from this single source

### `config/resume-data.js` — Resume Data

- Single source of truth for all resume content
- Used by the AI prompt builder and PDF generator
- Dynamically reloaded on each resume request (cache-busted via `delete require.cache`)

---

## Middleware Stack

Middleware executes in this order on every request:

```
Request → Helmet → CORS → Compression → Rate Limiter → Morgan → Body Parser → Route Handler
```

| Module | File | Purpose |
|---|---|---|
| Helmet | `middleware/security.js` | Sets security headers (CSP, HSTS, X-Frame) |
| CORS | `middleware/security.js` | Configurable cross-origin policy |
| Compression | `middleware/security.js` | Gzip response compression |
| Rate Limiter | `middleware/security.js` | 100 req/15min general, 10 req/15min for AI |
| Morgan | `server.js` | HTTP request logging |
| Body Parser | `server.js` | JSON body parsing (1MB limit) |
| Auth | `middleware/auth.js` | Admin key verification via `X-Admin-Key` header |
| Error Handler | `middleware/error-handler.js` | 404 + global error handler with dev stack traces |

---

## Route Handlers

### `routes/chat.js` — AI Chatbot

```
POST /api/chat
```

**Flow:**
1. Validate `messages` array with `express-validator`
2. Apply AI rate limiter (10 req/15min)
3. Forward messages to Groq API (`llama-3.3-70b-versatile`)
4. Cap `max_tokens` to configured maximum
5. Return AI response as JSON

**Security:** API key stays server-side; client never sees it.

---

### `routes/contact.js` — Email Sender

```
POST /api/contact
```

**Flow:**
1. Validate `name`, `email`, `subject`, `message` with `express-validator`
2. Sanitize all inputs with `escapeHtml()` to prevent XSS in email body
3. Send email via module-level Nodemailer transporter (Gmail SMTP)
4. Use `replyTo` header so replies go to the sender's email

---

### `routes/resume.js` — AI Resume Builder

```
POST /api/tailor-resume
```

**Flow:**
1. Validate job description (min 50 chars)
2. Load latest resume data (cache-busted)
3. Build system prompt with ATS optimization instructions
4. Send to Groq API → receive tailored JSON (summary, skills, soft skills)
5. Parse and sanitize AI response (strip verbose explanations)
6. Generate PDF with `PDFKit` (A4, proper margins, two-column layout)
7. Stream PDF as binary response

**PDF Generation (`generatePDF`):**
- Smart page breaks (checks remaining space before each section)
- Two-column skill rows with bullet alignment
- Right-aligned dates for experience/projects
- Section headers with horizontal rules

---

### `routes/upload.js` — Photo Upload

```
GET  /upload        → Serves upload HTML page
POST /upload        → Handles file upload (admin-only)
```

**Flow:**
1. Serve inline HTML page with drag-and-drop upload UI
2. Require `X-Admin-Key` header for POST requests
3. Use `multer` with disk storage to save as `hero.jpg` or `about.jpg`
4. File type filtering: JPEG, PNG, WebP only
5. File size limit: 5MB

---

## Frontend Architecture

### `script.js` — Class-Based Design

All features are implemented as standalone ES6 classes, instantiated on `DOMContentLoaded`:

| Class | Purpose |
|---|---|
| `AdminAuth` | URL-based admin mode toggle, persists in localStorage |
| `TypingAnimation` | Rotating text effect in hero section |
| `ScrollReveal` | IntersectionObserver-based fade-in animations |
| `StatsCounter` | Animated number counting for stats |
| `ParticleSystem` | Floating particles in hero background |
| `Navbar` | Scroll-aware navbar with mobile hamburger menu |
| `SmoothScroll` | Anchor link smooth scrolling |
| `BackToTop` | Show/hide back-to-top button on scroll |
| `CursorGlow` | Custom cursor glow effect (desktop only) |
| `ContactForm` | Async form submission with loading/success/error states |
| `Chatbot` | Full chat UI with typing indicators, suggestions, fallback responses |
| `ResumeBuilder` | Job description input → progress animation → PDF download |
| `ScrollIndicatorHide` | Hides scroll indicator after scrolling |

### Admin/Recruiter Mode

- **Recruiter (default):** Sees static resume download button, no resume builder
- **Admin (`?admin=true&key=xxx`):** Sees AI resume builder, photo upload link
- Mode persisted in `localStorage`, admin-only elements physically removed from DOM for non-admins

---

## Data Flow Diagrams

### Chat Flow

```
User Types → Chatbot.sendMessage()
  → addMessage(user)
  → addTypingIndicator()
  → POST /api/chat { messages: [...history] }
  → Server validates → Groq API → Response
  → removeTypingIndicator()
  → addMessage(bot)
  → Push to chatHistory[]
```

### Resume Builder Flow

```
User Pastes JD → ResumeBuilder.generate()
  → showProgress() (5-stage animation)
  → POST /api/tailor-resume { jobDescription }
  → Server: Groq AI tailors → PDFKit generates PDF
  → Client receives PDF blob
  → URL.createObjectURL(blob)
  → Auto-trigger download + show download button
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GROQ_API_KEY` | ✅ | — | Groq API key for AI features |
| `EMAIL_USER` | For contact | — | Gmail address |
| `EMAIL_PASS` | For contact | — | Gmail app password |
| `ADMIN_KEY` | No | `dev-key-123` | Admin authentication key |
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | `development` or `production` |
| `GROQ_MODEL` | No | `llama-3.3-70b-versatile` | AI model name |
| `CORS_ORIGIN` | No | `*` | Allowed CORS origins |
| `RATE_LIMIT_MAX` | No | `100` | General rate limit per window |
| `RATE_LIMIT_AI_MAX` | No | `10` | AI endpoint rate limit |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` (15min) | Rate limit window |
