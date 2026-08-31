---
id: PROJECT_CONTEXT
title: Project Context - world-builder-site
version: 2.0.0
status: active
---

# PROJECT_CONTEXT.md — world-builder-site

## Project Overview

World-builder-site is a static, browser-based web application for collaborative world-building using a card-draw based roleplaying mechanic. The app combines a canonical rule system (cards → world events), an interactive deck browser, and game play simulator with static card decks.

## Primary Goals

- Provide a fast, responsive, and completely static single-page application (SPA).
- Frontend implemented in **React + TypeScript (Vite) + Tailwind CSS**.
- Hosted and automatically deployed via **GitHub Pages** on custom domain: `world-building.inbarrose.com`.
- No backend/server-side requirements — all game mechanics and card decks load from static JSON files in `public/data/`.

## Architecture & Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide React icons
- **Routing**: React Router 6 with SPA fallback (`404.html` and `CNAME`)
- **Testing**: Vitest + React Testing Library
- **CI/CD**: GitHub Actions deploying to GitHub Pages

## Local Development

```bash
cd frontend
npm install
npm run dev
npm test
npm run build
```

