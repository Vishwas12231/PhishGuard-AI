# PhishGuard - Cyber Threat Audit & Phishing Analyzer

**PhishGuard** is an advanced, full-stack security intelligence platform designed to scan, analyze, and diagnose cyber threat vectors—including suspicious emails, malicious URLs, and screenshot-captured login forms. Leveraging the state-of-the-art **Google Gemini AI SDK** (`@google/genai`), the system evaluates syntactic markers, suspicious domains, and layout characteristics in real-time to generate interactive scores, action-mitigation checklists, high-fidelity **PDF client briefs**, and raw **JSON audit records**.

---

## 🛠️ Key Platform Features

- **📧 High-Fidelity Email Analysis**: Parses suspicious message contents, sender profiles, and subject lines to verify syntactic alignment, threat cues, and phishing templates.
- **🔗 Intelligent Link Scanner**: Identifies suspicious subdomains, domain-spoofing setups, and redirection paths.
- **📸 Screenshot Phishing Recognition**: Processes uploaded images of login portals or website interfaces using Gemini Computer Vision models.
- **🛡️ Secure Session Framework**: Supports complete user authentication (Registration/Login) and maintains clean **Guest Session Persistence** for seamless trial runs.
- **💬 AI Security Chatbot**: Consult with a dedicated security bot regarding scan results, potential exploits, and organizational security policies.
- **📄 Professional PDF Export**: Generate clean, elegant, A4 print-ready PDF audit briefs using `jspdf` to share with clients or compliance teams.

---

## 🏗️ Technical Stack Architecture

- **Frontend Core**: React 19 (`functional components` + `hooks`), TypeScript, Tailind CSS v4, Lucide Icons, and `@motion` animations.
- **Backend Service**: Express.js server hosted inside standard Node.js runtime.
- **Compilation Engine**: Bundled and orchestrated during development with **Vite** and packaged for production via **esbuild** into a standalone CommonJS execution target (`dist/server.cjs`) to guarantee speedy cold starts and strict type compliance.
- **AI Core Intelligence**: Official `@google/genai` Multi-Modal integration.
- **Document Rendering**: High-fidelity Client-Side PDF Synthesis using `jspdf`.

---

## 🚀 Step-by-Step Complete Setup Guide

Follow the steps below to set up and execute the PhishGuard application locally:

### 1. Prerequisites

Before starting, ensure that you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher is highly recommended)
- **NPM** (v9.0.0 or higher)
- A **Google Gemini API Key** (You can obtain one from [Google AI Studio](https://aistudio.google.com/))

---

### 2. Install Package Dependencies

Navigate to the project root directory in your terminal and execute:

```bash
npm install
```

This installs all dependencies declared in `package.json`, including the `@google/genai` library, Express, React, Vite, TSX, esbuild, and jsPDF.

---

### 3. Environment Variable Configuration

Copy the example configuration file at the project root to create your active environment setup:

```bash
cp .env.example .env
```

Open the newly created `.env` file in your preferred text editor and configure your variables:

```env
# Google Gemini API Key - Required for backend AI capabilities
GEMINI_API_KEY="AIzaSyYourActualGeminiAPIKeyHere"

# Application URL - The base URL where the local dev/production server is hosted
APP_URL="http://localhost:3000"
```

---

### 4. Running the Project (Step-by-Step)

You can run the application in either **Development Mode** (with instant rebuilds and Vite assets compiled on-the-fly) or **Production Mode** (fully compiled and bundled for maximum performance).

#### 💡 Option A: Running in Development Mode (Recommended for testing/editing)

To start the development server, run:

```bash
npm run dev
```

During execution:
- The TSX (TypeScript Execute) engine boots the Express backend in `server.ts`.
- Vite spins up as a middleware routing engine on `http://localhost:3000`.
- Open your browser and navigate to **`http://localhost:3000`** to view and interact with the application.

#### 📦 Option B: Building and Running in Production Mode (Recommended for Deployment)

To build the client-side files and compile the backend into a compact single-bundle file for static hosting:

**Step 1: Execute the compile/build pipeline**
```bash
npm run build
```
This multi-stage script compiles all your React TSX assets into static JS/CSS blocks in `dist/` and compiles the backend server via `esbuild` into `dist/server.cjs`.

**Step 2: Start the production server**
```bash
npm run start
```
The server will boot from the compiled bundle and listen on port `3000` (`http://localhost:3000`).

---

## 📂 Project Directory Structure

```text
├── src/                      # Client-side React Application
│   ├── components/           # Extracted UI component files
│   │   ├── DetailedView.tsx  # Full audit visualization cards
│   │   ├── ThreatHistory.tsx # Past reports table, filter, & export triggers
│   │   └── ...
│   ├── App.tsx               # Main React entry layout & routes controller
│   ├── types.ts              # Declarations of typescript interfaces and enums
│   └── index.css             # Tailwind CSS import styles & print layout rules
├── server/                   # Backend middleware modules
│   └── middleware/
│       └── auth.ts           # Secure JWT check & Guest match middleware
├── server.ts                 # Full-stack backend Express application 
├── .env.example              # Template containing expected environment keys
├── index.html                # Entry web template
├── vite.config.ts            # Vite building plugin and proxy rules
└── package.json              # Script shortcuts & third-party libraries
```

---

## 🔒 Security Notice

Never commit your `.env` files containing actual production credentials or private Gemini API keys to public repositories. Ensure that `.env` remains ignored by keeping it listed inside the `.gitignore` configuration.
