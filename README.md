# world-builder-site

Static interactive site for collaborative card-driven world-building.

Hosted on **GitHub Pages** at [world-building.inbarrose.com](https://world-building.inbarrose.com).

## 🚀 Quick Start

### Local Development

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Run dev server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Run unit tests**:
   ```bash
   npm test
   ```

4. **Build production static site**:
   ```bash
   npm run build
   ```
   Outputs production-ready static assets to `frontend/dist/`.

## 🌐 Deployment to GitHub Pages

This site is deployed automatically to GitHub Pages on every push to the `main` branch via GitHub Actions (`.github/workflows/deploy.yml`).

### Custom Domain & DNS Setup

- **Custom Domain**: `world-building.inbarrose.com`
- **CNAME File**: `frontend/public/CNAME`
- **DNS Configuration**: Create a `CNAME` record in your DNS provider:
  - **Host / Name**: `world-building`
  - **Target / Value**: `<your-github-username>.github.io`
- **GitHub Repository Settings**:
  - Go to **Settings** > **Pages**
  - Source: **GitHub Actions**
  - Custom domain: `world-building.inbarrose.com` (with Enforce HTTPS enabled)

## 📁 Project Structure

```
world-builder-site/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages automated build & deploy
├── frontend/
│   ├── public/
│   │   ├── CNAME               # Custom domain configuration
│   │   └── data/               # Static card deck data JSONs
│   ├── src/
│   │   ├── components/         # Reusable React components (Layout, etc.)
│   │   ├── pages/              # Main routes (Home, Rules, Play)
│   │   ├── test/               # Unit tests (Vitest + Testing Library)
│   │   ├── App.tsx             # Root router & layout
│   │   └── main.tsx            # React entry point
│   ├── package.json
│   └── vite.config.ts
└── rules_v2025-01-27.json      # Canonical game rules reference
```

## 📋 License

MIT. See `LICENSE`.

