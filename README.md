# 🃏 AgilePoint Planning Poker
### *100% Free & Self-Hostable Real-Time Story Pointing for Agile Teams*

[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker&logoColor=white)](Dockerfile)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg?logo=node.js&logoColor=white)](https://nodejs.org)
[![UI/UX Pro Max](https://img.shields.io/badge/UI%2FUX_Pro_Max-Evolved_Soft_UI-8B5CF6.svg)](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)

AgilePoint is a modern, enterprise-grade, **free alternative to commercial planning poker tools** (like PlanningPoker.com or ScrumPoker-online). Designed without subscription fees, seat caps, or mandatory third-party accounts, it enables distributed engineering teams to estimate sprint user stories with speed, fun, and deep consensus analytics.

---

## 🎨 Design System & UI/UX Standards

AgilePoint is designed following the **[UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)** design intelligence specification:

- **Style**: **Soft UI Evolution** (Subtle elevated depth, high-contrast borders, tactile micro-interactions, responsive 150-300ms transitions).
- **Pattern**: **Real-Time Collaborative Workspace** (Zero-delay presence indicators, synchronized timer, instant card count telemetry).
- **Typography**: 
  - **Headings & Cards**: `Outfit` (Modern geometric confidence).
  - **Body & Metrics**: `Work Sans` (Crisp readability for tickets, descriptions, and consensus numbers).
- **Color Tokens**:
  - **Primary**: Indigo (`#4F46E5` / `#6366F1`)
  - **Success / Consensus**: Emerald (`#10B981` / `#059669`)
  - **Warning / Outliers**: Amber (`#F59E0B`)
  - **Destructive**: Rose (`#EF4444`)
  - **Dark & Light Modes**: Fully adaptive contrast ratios meeting WCAG 2.1 AA (4.5:1 minimum).
- **Micro-Interactions**:
  - 3D CSS flip animations with realistic perspective (`perspective-1000`).
  - Web Audio API procedural sound synthesizer (tactile card snap, reveal chime, countdown ticks, and celebration fanfare). Zero external MP3 asset downloads.
  - Confetti burst on unanimous estimates.
  - Live floating emoji reactions (`👏`, `☕`, `🤔`, `🚀`, `💡`, `❤️`, `💯`).

---

## 🚀 Key Features

| Category | Feature | Description |
|---|---|---|
| **Zero Cost** | **No Paywalls or User Limits** | Unlimited team members, unlimited sessions, 100% self-hosted on your own infrastructure or free-tier hosting. |
| **Estimation Scales** | **Preset & Custom Decks** | Standard Fibonacci (`0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?`), Modified Fibonacci (`0, ½, 1, 2, 3, 5, 8, 13, 20, 40, 100, ?`), T-Shirt (`XS, S, M, L, XL, XXL`), Powers of 2, Risk/Complexity, or Custom. |
| **Smart Consensus** | **Deep Analytics** | Instant calculation of **Arithmetic Mean** (with nearest deck card), **Median**, **Mode**, and **Agreement Percentage**. |
| **Agile Dialogue** | **Outlier Identification** | Automatically identifies the lowest and highest estimators to prompt constructive conversation and uncover hidden technical risks. |
| **Backlog Manager** | **Jira & CSV Import/Export** | Add tickets, paste bulk issues copied directly from Jira / Linear, and export completed estimates to CSV or Markdown. |
| **Facilitator Controls** | **Session Master Tools** | Toggle auto-reveal, start/pause countdown timers, reassign roles, kick inactive participants, or revote stories with one click. |
| **Accessibility** | **Keyboard-First** | Vote using keyboard numbers `1`–`9`, clear vote with `C` or `Esc`, full keyboard focus indicators. |
| **Multi-Device** | **QR Code & Mobile Ready** | Scan QR code with your mobile camera to join the session from anywhere. |

---

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ (Node 20 or 22 recommended)
- npm 9+

### 1. Installation
Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/your-username/planning-poker.git
cd planning-poker

# Install dependencies for root, server, and client in one command
npm run install:all
```

### 2. Run in Development Mode
Runs both the Vite frontend (`http://localhost:5173`) and the Socket.IO server (`http://localhost:4000`) concurrently with hot-reloading:

```bash
npm run dev
```

Open your browser at [http://localhost:5173](http://localhost:5173).

### 3. Run Production Build Locally
Build the React application and run the standalone Node.js production server:

```bash
npm run build
npm start
```
Access the application at [http://localhost:4000](http://localhost:4000).

---

## 🐳 Docker Deployment

Run with a single command using Docker Compose:

```bash
docker compose up -d
```

Your Planning Poker instance is now running at `http://localhost:4000` with local disk persistence for rooms in a Docker volume!

To stop the container:
```bash
docker compose down
```

---

## 🌐 Free Cloud Hosting Options

### Option A: Vercel (Frontend) + Free Render / Railway (Backend)
Because AgilePoint uses real-time WebSockets, the architecture separates the frontend static assets from the stateful WebSocket server:

1. **Deploy Backend (100% Free on Render / Railway)**:
   - Fork or push this repository to GitHub.
   - Go to [Render.com](https://render.com) and click **New > Blueprint** (or **New Web Service**). It will automatically detect [`render.yaml`](render.yaml).
   - Once deployed, copy your backend URL (e.g. `https://agilepoint-server.onrender.com`).

2. **Deploy Frontend to Vercel**:
   - Go to [Vercel.com](https://vercel.com) and import your GitHub repository.
   - Under **Environment Variables**, add:
     - `VITE_SERVER_URL` = `https://your-backend-url.onrender.com`
   - Click **Deploy**!
   - Alternatively via CLI:
     ```bash
     vercel login
     vercel
     ```

### Option B: All-in-One Standalone on Render / Railway / Fly.io
Deploy both frontend and backend as a single service using the included [`Dockerfile`](Dockerfile) or:
```bash
fly launch
# or
railway up
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `1` – `9` | Select card 1 through 9 from your estimation deck |
| `C` or `Esc` | Clear / Deselect your active vote |

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
