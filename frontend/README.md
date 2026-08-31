# Frontend (React + TypeScript)

Static Single Page Application for World Builder built with Vite, React, TypeScript, and Tailwind CSS. Deployed to GitHub Pages at [world-building.inbarrose.com](https://world-building.inbarrose.com).

## Quick Start

1. `cd frontend`
2. `npm install`
3. `npm run dev` — start local development server at `http://localhost:3000`
4. `npm test` — run unit tests (Vitest)
5. `npm run build` — build static production bundle into `dist/`
6. `npm run preview` — preview production build locally

## Tech Stack

- **Vite** — Build tool and dev server
- **React 18** — UI library
- **TypeScript** — Static typing
- **Tailwind CSS** — Styling
- **React Router 6** — Client-side SPA routing
- **Vitest & React Testing Library** — Unit testing

## Static Data

All game rules and card decks are stored as static JSON files in `public/data/` and loaded client-side directly by the app.

