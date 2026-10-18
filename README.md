# WILZION EEG NeuroSim AI

A simulated EEG mental-state classification system (Garden City University HCI project), built with React, Vite, Tailwind and the Base44 SDK.

## Run in GitHub Codespaces

1. On GitHub, open this repo and choose **Code → Codespaces → Create codespace on main**.
2. The devcontainer installs dependencies and starts the dev server on port **5173**; open the forwarded port when VS Code offers it.
3. If it doesn't start by itself, run `npm install` then `npm run dev`.

## Backend / login (Base44)

The login, profiles, history and admin pages talk to a Base44 backend. Without one the UI loads but `/api` calls fail.

1. Copy `.env.example` to `.env.local` and set `VITE_BASE44_APP_ID` (from your Base44 Builder URL, `app.base44.com/apps/<id>/...`) and `VITE_BASE44_APP_BASE_URL` (your published app URL).
2. Restart `npm run dev`.

Alternatively use the Base44 CLI: `npm install -g base44@latest`, then `base44 login`, `base44 link`, `base44 dev` (requires [Deno](https://docs.deno.com/runtime/getting_started/installation/)). Local entity data is in-memory only.

## Scripts

- `npm run dev` – start the dev server
- `npm run build` – production build to `dist/`
- `npm run lint` – ESLint

## Layout

- `src/pages/neuro/` – the NeuroSim detector, history and HCI tabs
- `src/pages/` – login, register, profile, database and admin pages
- `base44/entities/` – entity schemas; `base44/functions/analyseStat/` – analysis backend function
