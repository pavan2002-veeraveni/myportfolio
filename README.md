# 🚀 Pavan Kumar — Portfolio & AI Resume Builder

A production-ready portfolio website with an integrated **AI chatbot** (powered by Groq/LLaMA) and an **AI-powered resume builder** that generates ATS-optimized PDFs tailored to any job description.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🌐 **Portfolio** | Responsive, animated portfolio with smooth scrolling, particles, and dark theme |
| 🤖 **AI Chatbot** | Groq-powered assistant that answers questions about skills, projects & experience |
| 📄 **AI Resume Builder** | Paste a job description → get an ATS-optimized PDF resume (80-95% match score) |
| 📸 **Photo Uploader** | Admin-protected image upload for hero & about photos |
| 📧 **Contact Form** | Server-side email delivery via Gmail + Nodemailer |
| 🔒 **Security** | Helmet, CORS, rate limiting, input validation, XSS protection |

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **AI:** Groq API (LLaMA 3.3 70B)
- **PDF:** PDFKit
- **Email:** Nodemailer (Gmail SMTP)
- **Security:** Helmet, express-rate-limit, express-validator
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (no framework)
- **Fonts:** Inter, JetBrains Mono (Google Fonts)
- **Icons:** Font Awesome 6

---

## 📁 Project Structure

```
pavan_portfolio_template/
├── config/
│   ├── index.js            # Centralized configuration
│   └── resume-data.js      # Resume content (single source of truth)
├── middleware/
│   ├── auth.js             # Admin key authentication
│   ├── error-handler.js    # 404 + global error handler
│   └── security.js         # Helmet, CORS, rate limiting
├── routes/
│   ├── chat.js             # POST /api/chat — AI chatbot proxy
│   ├── contact.js          # POST /api/contact — Email sender
│   ├── resume.js           # POST /api/tailor-resume — AI resume + PDF
│   └── upload.js           # GET/POST /upload — Photo management
├── assets/images/          # Hero & about photos
├── index.html              # Main portfolio page
├── script.js               # Frontend logic (classes-based architecture)
├── styles.css              # Full CSS with animations
├── server.js               # Express server entry point
├── Dockerfile              # Docker container config
├── fly.toml                # Fly.io deployment config
├── .env.example            # Environment variables template
└── package.json
```

---

## ⚡ Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A [Groq API key](https://console.groq.com/) (free)
- Gmail account with [App Password](https://myaccount.google.com/apppasswords)

### 1. Clone & Install

```bash
git clone https://github.com/pavan2002-veeraveni/pavan-portfolio.git
cd pavan-portfolio
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your keys:

```env
GROQ_API_KEY=your_groq_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
ADMIN_KEY=your_secret_admin_key
```

### 3. Run

```bash
npm run start       # Production
npm run dev         # Development (auto-reload)
```

Open **http://localhost:3000** 🎉

---

## 🔑 Admin Mode

Access admin features (Resume Builder, Photo Upload) by visiting:

```
http://localhost:3000/?admin=true&key=YOUR_ADMIN_KEY
```

To exit admin mode: `http://localhost:3000/?admin=false`

---

## 🚀 Deployment

### Koyeb (Recommended — Free, No Credit Card)

1. Push code to GitHub
2. Sign up at [koyeb.com](https://koyeb.com) with GitHub
3. Create Service → GitHub → Select repo → Dockerfile builder
4. Set Port: `3000`, add environment variables
5. Deploy → Live at `https://your-app.koyeb.app`

### Fly.io (Free with Credit Card Verification)

```bash
fly auth signup
fly launch --no-deploy
fly secrets set GROQ_API_KEY=xxx EMAIL_USER=xxx EMAIL_PASS=xxx ADMIN_KEY=xxx
fly deploy
```

### Render (Free, No Credit Card)

1. Sign up at [render.com](https://render.com) with GitHub
2. New → Web Service → Connect repo
3. Build: `npm install`, Start: `npm run start`
4. Add environment variables → Deploy

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/chat` | — | AI chatbot (rate limited) |
| `POST` | `/api/contact` | — | Send contact email |
| `POST` | `/api/tailor-resume` | — | Generate tailored PDF resume |
| `GET` | `/upload` | — | Photo upload page |
| `POST` | `/upload` | Admin Key | Upload hero/about photo |

---

## 🔒 Security Features

- **Helmet** — Security headers (CSP, HSTS, etc.)
- **Rate Limiting** — General: 100 req/15min, AI: 10 req/15min
- **Input Validation** — express-validator on all endpoints
- **XSS Protection** — HTML sanitization in email templates
- **CORS** — Configurable origin restriction
- **Admin Auth** — API key-based access control

---

## 📄 License

MIT © Pavan Kumar Veeraveni
