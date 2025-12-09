# TimeFlow

Desktop time tracker for Windows that combines project-based tracking, weekly stats, and a Pomodoro timer with a mini always-on-top view. Built with Electron, Vite, and React.

## Features
- Project tracking with per-project totals and quick start/stop timer
- Manual time adjustments with signed add/subtract sessions
- Weekly stats snapshot to see recent effort across projects
- Pomodoro timer with configurable work/short/long break lengths and alerts
- Mini mode that shrinks the app, stays on top, and shows either tracker or Pomodoro controls
- Local persistence (projects, sessions, Pomodoro durations) via `localStorage`

## Requirements
- Node.js 18+ (recommended) and npm
- Windows 10/11 for the packaged installer (dev server works cross-platform)

## Getting Started
```bash
# install dependencies
npm install

# start the app in development (launches Vite + Electron)
npm run dev
```

The Vite dev server will start and Electron will open the app window. Edits to renderer or Electron files trigger hot reload or restart via `vite-plugin-electron`.

## Building & Packaging
```bash
# typecheck, build renderer + Electron, then create installer
npm run build
```

Outputs:
- Renderer bundle: `dist/`
- Electron main/preload bundle: `dist-electron/`
- Windows installer (NSIS): `dist/TimeFlow Setup <version>.exe`

Build configuration lives in `electron-builder.yml` (NSIS, one-click disabled, custom install directory allowed). Icons/resources are under `build/`.

## Project Structure
- `src/` React UI, hooks, styles, and utility helpers
- `electron/` Electron main and preload scripts
- `vite.config.ts` Vite + `vite-plugin-electron` setup
- `electron-builder.yml` Packaging targets and resources

## Scripts
- `npm run dev` – start Vite dev server and Electron
- `npm run build` – typecheck, bundle renderer/Electron, and create the installer
- `npm run preview` – preview the built renderer (browser only)

## Data & Persistence
All app data (projects, sessions, Pomodoro durations) is stored locally in the browser process via `localStorage`. No external services are used.
