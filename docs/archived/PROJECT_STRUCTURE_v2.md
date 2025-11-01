# Project Structure - SC Farense AI Assistant v2.0

## Complete Directory Overview

```
chatbot_2.0/
│
├── 📄 DOCUMENTATION (NEW/UPDATED)
│   ├── UI_ENHANCEMENTS_SUMMARY.md       ⭐ Quick overview of all v2.0 changes
│   ├── ENHANCEMENTS_v2.0.md              ⭐ Complete technical documentation
│   ├── MOBILE_OPTIMIZATION_GUIDE.md      ⭐ Mobile-specific features & guide
│   ├── DEPLOYMENT_CHECKLIST.md           ⭐ Pre-deployment testing checklist
│   ├── LOCAL_LAUNCH_GUIDE.md             ⭐ How to run locally
│   ├── PROJECT_STRUCTURE_v2.md           ⭐ This file
│   └── README.md                         📋 Main project README
│
├── 📁 PUBLIC (Frontend - UPDATED)
│   ├── index.html                        ✨ UPDATED - Semantic HTML, accessibility
│   ├── styles.css                        ✨ UPDATED - 1239 lines with animations, dark mode
│   ├── script.js                         ✅ Unchanged - works with new HTML
│   ├── manifest.json                     🆕 PWA configuration file
│   ├── client.js                         📝 Alternative client script
│   ├── fotografias/                      📷 Player and president photos
│   │   ├── jogadores/                    Players photos
│   │   │   └── *.png, *.webp
│   │   └── presidentes/                  President photos
│   │       └── *.png, *.webp
│   └── README_PUBLIC.md                  Documentation for public folder
│
├── 📁 SRC (Backend - Unchanged)
│   ├── server.js                         ✅ Express.js server (works perfectly)
│   ├── 📁 core/                          Core agent framework
│   │   ├── BaseAgent.js                  Base class for agents
│   │   ├── AgentRouter.js                Agent routing system
│   │   ├── AgentsFactory.js              Agent factory
│   │   └── AgentAdapter.js               Agent adapter
│   ├── 📁 agents/                        12 specialized AI agents
│   │   ├── biografiasAgent.js            Historical figures
│   │   ├── resultadosAgent.js            Match results
│   │   ├── classificacoesAgent.js        League standings
│   │   ├── jogadoresAgent.js             Player information
│   │   ├── estatisticasAgent.js          Statistics & analysis
│   │   ├── epocaDetalhadaAgent.js        Season details
│   │   ├── epocasAgent.js                Seasons overview
│   │   ├── epocasCompletoAgent.js        Complete seasons
│   │   ├── livrosAgent.js                Book references
│   │   ├── livroConteudoAgent.js         Book content
│   │   ├── presidentesAgent.js           President info
│   │   └── fundacaoAgent.js              Foundation & history
│   └── 📁 utils/
│       └── injectImages.js               Image injection utility
│
├── 📁 DADOS (Data Files)
│   ├── biografias/                       ~210 markdown biographies
│   │   ├── jogadores/                    Player histories (*.md)
│   │   ├── presidentes/                  President profiles (*.md)
│   │   ├── treinadores/                  Coach information (*.md)
│   │   └── outras_figuras/               Other historical figures (*.md)
│   ├── classificacoes/                   League standings by season
│   │   └── *.json, *.md
│   ├── resultados/                       Match results data
│   │   ├── resultados_completos.md
│   │   └── resultados_para_agente.md
│   └── dados_completos_farense.json      Consolidated 54-season data
│
├── 📁 NETLIFY (Serverless Deployment)
│   ├── 📁 functions/
│   │   └── api.js                        Netlify Functions wrapper
│   ├── 📁 data/                          Deployment data files
│   └── netlify.toml                      Netlify configuration
│
├── 📁 SCRIPTS (Build & Utilities)
│   ├── build.js                          Build script
│   └── compileBiografias.js              Biography compiler
│
├── 📁 LLM_TRAINING (ML Components - Separate)
│   ├── 📁 notebooks/                     Jupyter notebooks
│   ├── 📁 checkpoints/                   Training checkpoints
│   ├── 📁 output/                        Model output
│   └── 📄 Training-related files
│
├── 📁 CONFIG
│   ├── .env.example                      Environment variables template
│   └── .eslintrc.json                    ESLint configuration
│
├── 📄 PACKAGE FILES
│   ├── package.json                      v2.0.0 dependencies
│   ├── package-lock.json                 Dependency lock file
│   └── .gitignore                        Git ignore rules
│
├── 📄 CONFIG FILES
│   ├── netlify.toml                      Netlify deployment config
│   ├── .env                              Environment variables (not in repo)
│   └── .eslintignore                     ESLint ignore rules
│
└── 📄 LEGACY/BACKUP
    ├── app.py                            Flask app (legacy)
    ├── README_OLD.md                     Previous readme
    └── Other documentation files
```

---

## Frontend Structure (`/public`)

### 🎨 Styling Enhancements

```
styles.css (1239 lines)
├── CSS VARIABLES (Design System)
│   ├── Color Palette (gray-50 to gray-950)
│   ├── Accent Colors (primary, secondary, highlight, success, warning, info)
│   ├── Gradients (dark, light, accent, subtle)
│   ├── Shadows (sm, md, lg, xl, 2xl)
│   ├── Typography (primary, mono)
│   ├── Spacing (xs, sm, md, lg, xl, 2xl)
│   ├── Border Radius (sm, md, lg, xl, 2xl, full)
│   └── Transitions (fast, base, slow, smooth)
│
├── DARK MODE SUPPORT
│   └── @media (prefers-color-scheme: dark)
│       └── Inverted color palette
│
├── LAYOUT COMPONENTS
│   ├── Container & Flexbox
│   ├── Sidebar (320px → mobile horizontal)
│   ├── Chat Area
│   ├── Header
│   ├── Main Content
│   └── Input Area
│
├── ANIMATIONS (8 keyframes)
│   ├── slideInUp
│   ├── bounceIcon
│   ├── staggerIn
│   ├── messageSlideIn
│   ├── floatIcon
│   ├── slideInLeft/Right
│   ├── scaleIn
│   ├── shimmer
│   └── spin
│
├── INTERACTIVE STATES
│   ├── Hover effects
│   ├── Focus states
│   ├── Active states
│   └── Loading states
│
├── RESPONSIVE DESIGN
│   ├── Mobile (≤480px)
│   ├── Tablet (481-768px)
│   ├── Large Tablet (769-1024px)
│   └── Desktop (>1024px)
│
├── ACCESSIBILITY
│   ├── Color contrast
│   ├── Focus indicators
│   ├── Touch targets (44px+)
│   └── Semantic styling
│
└── UTILITY CLASSES
    ├── Loading states
    ├── Animations
    ├── Markdown styling
    └── Helper classes
```

### 📱 HTML Structure (`index.html`)

```
index.html
├── HEAD
│   ├── Meta tags (charset, viewport, description, keywords)
│   ├── PWA support (manifest.json, favicon)
│   ├── Font preconnects (performance optimization)
│   ├── Stylesheet links
│   └── Font imports (Google Fonts)
│
└── BODY
    ├── CONTAINER (flex layout)
    │   ├── SIDEBAR (navigation)
    │   │   ├── Header with logo
    │   │   ├── Chat history (nav list)
    │   │   └── Stats (agents, biographies)
    │   │
    │   └── CHAT-AREA (main content)
    │       ├── HEADER (banner)
    │       │   ├── Title & subtitle
    │       │   └── Status indicator
    │       │
    │       ├── MAIN (chat messages)
    │       │   └── Welcome screen
    │       │       ├── Icon
    │       │       ├── Title
    │       │       ├── Description
    │       │       └── Quick actions (4 buttons)
    │       │
    │       └── CHAT-INPUT (form)
    │           ├── Input field
    │           ├── Send button
    │           └── Instructions text
    │
    └── SCRIPT (client.js)
```

### 🎯 Key HTML Features

```
SEMANTIC ELEMENTS:
✅ <header role="banner">     Main page header
✅ <nav aria-label="">        Sidebar navigation
✅ <main role="region">       Chat content area
✅ <section>                  Input area
✅ <form>                     Chat form

ACCESSIBILITY:
✅ aria-label                 Descriptive labels
✅ aria-hidden="true"         Hide decorative elements
✅ aria-live="polite"         Announce chat updates
✅ role attributes            Custom element roles
✅ WCAG AA contrast           Color contrast ratios
```

---

## Backend Structure (`/src`)

### Architecture Diagram

```
REQUEST FLOW:
1. POST /api/chat
   ↓
2. server.js (Express)
   ↓
3. AgentRouter (Smart routing)
   ↓
4. Topic Detection (Keywords)
   ↓
5. Select Appropriate Agent
   ├── biografiasAgent        (People/history)
   ├── resultadosAgent        (Match results)
   ├── classificacoesAgent    (League standings)
   ├── jogadoresAgent         (Players)
   ├── estatisticasAgent      (Statistics)
   ├── epocaDetalhadaAgent    (Season details)
   ├── epocasAgent            (Seasons)
   ├── epocasCompletoAgent    (Full seasons)
   ├── livrosAgent            (Books)
   ├── livroConteudoAgent     (Book content)
   ├── presidentesAgent       (Presidents)
   └── fundacaoAgent          (Foundation)
   ↓
6. Load Context Data
   ├── Markdown files
   ├── JSON data
   └── Biography files
   ↓
7. GPT-4o-mini API Call
   ↓
8. Markdown → HTML Rendering
   ↓
9. Response to Client (HTML)
   ↓
10. Browser Displays Message
```

### Core Agent System

```
BaseAgent (Abstract)
    ├── Properties
    │   ├── name              Agent name
    │   ├── context           Domain knowledge
    │   ├── priority          Execution order
    │   ├── keywords          Detection keywords
    │   └── enabled           Active status
    │
    └── Methods
        ├── canHandle()       Check if applicable
        ├── process()         Handle request
        ├── getContext()      Provide knowledge
        ├── validate()        Validate data
        └── log()             Debug logging

Specialized Agents (12 total)
    ├── biografiasAgent       210+ biographies
    ├── resultadosAgent       Complete results
    ├── classificacoesAgent   Standings data
    ├── jogadoresAgent        Squad information
    ├── estatisticasAgent     Records & stats
    ├── epocaDetalhadaAgent   Season reports
    ├── epocasAgent           Season overviews
    ├── epocasCompletoAgent   Full season data
    ├── livrosAgent           Book references
    ├── livroConteudoAgent    Book content
    ├── presidentesAgent      Leadership history
    └── fundacaoAgent         Origin stories
```

---

## Data Structure (`/dados`)

### Biographies Organization

```
/dados/biografias/
├── jogadores/               Player biographies
│   ├── historia_hassan_nader.md
│   ├── historia_fernando_varela.md
│   └── ...
│
├── presidentes/             President information
│   ├── historia_presidente_x.md
│   └── ...
│
├── treinadores/             Coach information
│   └── historia_*.md
│
└── outras_figuras/          Other historical figures
    └── historia_*.md
```

### Results Data Format

```
resultados_completos.md
├── Season headers (1969/70, 1970/71, etc.)
├── Match results
│   ├── Date
│   ├── Opponent
│   ├── Score
│   ├── Goals (scorers)
│   └── Competition
└── Season statistics
```

### Consolidated Data

```
dados_completos_farense.json
{
  "seasons": [54 seasons of data],
  "players": [Complete player database],
  "statistics": [Aggregated stats],
  "records": [Club records],
  "championships": [Title history],
  "coaches": [Historical coaches],
  "presidents": [Leadership history]
}
```

---

## Deployment Structure (`/netlify`)

```
/netlify/
├── functions/
│   └── api.js               Serverless function
│       └── Wraps Express server
│
├── data/
│   └── Deployment files
│
└── netlify.toml
    ├── Build command
    ├── Publish directory
    ├── Functions directory
    ├── Redirects (API routing)
    ├── Headers
    └── Cache settings
```

---

## Configuration Files

### package.json
```json
{
  "name": "chatbot-sc-farense",
  "version": "2.0.0",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "build": "node scripts/build.js",
    "lint": "eslint src/ --fix",
    "format": "prettier --write 'src/**/*.js' 'public/**/*.js'"
  },
  "dependencies": {
    "express": "^4.18.2",
    "openai": "^4.20.1",
    "marked": "^16.4.1",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "jest": "^29.0.0"
  }
}
```

### netlify.toml
```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "public"

[functions]
  directory = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
```

---

## File Size Summary

| File | Before | After | Change |
|------|--------|-------|--------|
| index.html | 4.8 KB | 7.2 KB | +50% |
| styles.css | 17.1 KB | ~22 KB | +29% |
| Total CSS | 17.1 KB | ~22 KB | +29% |
| manifest.json | N/A | 2.5 KB | NEW |
| script.js | 5.2 KB | 5.2 KB | Unchanged |

**Total Frontend**: ~36.9 KB (optimized, justified by features)

---

## Dependencies Overview

### Production
- **express**: Web framework
- **openai**: GPT API integration
- **marked**: Markdown rendering
- **cors**: Cross-origin support
- **body-parser**: JSON parsing
- **dotenv**: Environment config

### Development
- **nodemon**: Auto-reload development
- **eslint**: Code linting
- **prettier**: Code formatting
- **jest**: Testing framework

---

## Quick Navigation Guide

### For Quick Overview
1. Read: `UI_ENHANCEMENTS_SUMMARY.md`
2. Time: 5-10 minutes

### For Mobile Testing
1. Read: `MOBILE_OPTIMIZATION_GUIDE.md`
2. Test on: iPhone, Android, Tablet

### For Local Development
1. Read: `LOCAL_LAUNCH_GUIDE.md`
2. Run: `npm run dev`
3. Visit: `http://localhost:3000`

### For Deployment
1. Read: `DEPLOYMENT_CHECKLIST.md`
2. Follow: Step-by-step guide
3. Deploy: `git push` or Netlify dashboard

### For Technical Details
1. Read: `ENHANCEMENTS_v2.0.md`
2. Topics: Animations, accessibility, performance

---

## Summary

### What Changed in v2.0

✅ **Frontend (Major Updates)**
- index.html: Semantic HTML + accessibility
- styles.css: Animations, dark mode, responsive
- manifest.json: NEW - PWA support

⚪ **Backend (No Changes)**
- server.js: Unchanged
- agents: Unchanged
- utils: Unchanged

✅ **Documentation (New)**
- 6 comprehensive guides
- Testing checklists
- Deployment procedures

---

## Access & Testing

### Local Development
```bash
npm run dev
# Visit: http://localhost:3000
```

### Mobile Testing
```bash
# Find IP: ifconfig | grep "inet "
# Visit: http://YOUR_IP:3000
```

### Production (Netlify)
```bash
git push origin main
# Auto-deploys to: https://sc-farense-ai.netlify.app
```

---

## Getting Help

### Documentation Map
1. **Quick Start**: LOCAL_LAUNCH_GUIDE.md
2. **Visual Features**: UI_ENHANCEMENTS_SUMMARY.md
3. **Mobile Details**: MOBILE_OPTIMIZATION_GUIDE.md
4. **Technical Info**: ENHANCEMENTS_v2.0.md
5. **Deployment**: DEPLOYMENT_CHECKLIST.md

### Project Files
- Frontend: `/public` directory
- Backend: `/src` directory
- Data: `/dados` directory
- Documentation: Root directory (*.md files)

---

**Status**: ✅ Complete & Ready for Testing/Deployment

All files are in place and the system is fully functional with v2.0 enhancements!

