> Migration update: this historical handoff remains for provenance. ChatGPT Sites uses Cloudflare Workers, not Vercel Functions. The isolated static-hosting branch implements a local preview; the move is not deployed or complete. Follow README.md and docs/HOSTING.md for current instructions.

# Handoff note for Codex: move aws-quiz to oddlytrue.ai

**Goal:** run the aws-quiz frontend *and* backend on oddlytrue.ai (ChatGPT Sites / Vercel) instead of the Raspberry Pi.

This branch (`claude/review-fixes`) holds the fixes and gameplay changes from a code review done by Claude Code. Read this file first, then delete it once the move is done.

## What's in this branch

### Backend (`backend/src`, Express + TypeScript)
The old `backend/*.js` files are gone, and `src/` is the only backend.

| Method | Route | Notes |
|---|---|---|
| GET | `/categories` | Returns the category ids. |
| GET | `/learn/:category` | Category must match `^[a-z0-9_]{1,50}$`. |
| POST | `/learn/:category` | Needs `Authorization: Bearer $ADMIN_API_KEY`. If `ADMIN_API_KEY` is unset, it returns 403, so adding questions is off. |

`createApp(service, apiKey)` in `src/app.ts` builds the app without starting a server, so it can be wrapped in a serverless function. `src/index.ts` is the only file that calls `listen`.

Environment variables:

| Variable | Default |
|---|---|
| `PORT` | 5000 |
| `SERVICES_FILE` | `backend/services.json` |
| `ADMIN_API_KEY` | unset (adding questions disabled) |
| `CORS_ORIGINS` | the raspberrynode.com sites plus `http://localhost:4000` (comma-separated list) |

Tests: `cd backend && npm ci && npm run build && npm test`. There are 34 tests and all pass.

### Question bank
- `backend/services.json` has 290 questions. Outdated and retired AWS services have been removed.
- `node scripts/validate-questions.js backend/services.json` checks that each question has 4 unique options, that there are no duplicates, and that no outdated service names appear. Keep this check in CI.
- The JSON key is spelled `catagory` throughout the code. That's intentional for now; renaming it means changing the data, backend, frontend and tests in one commit.

### Frontend (`frontend/public`, plain HTML, CSS and JS with no build step)
- The API address is set in one place: `API_BASE` in `frontend/public/js/common.js`. It's `http://localhost:5000` on localhost and `https://awsquizapi.raspberrynode.com` everywhere else.
- `frontend/app.js` is only a static file server for local development on port 4000.

### Ignore these files
`backend/servicesbkup.json`, `backend/services.bkup.1.json` and `generateGameQuestions/*` are stale. Don't regenerate the question bank from them: they're missing 64 newer questions and would bring retired services back.

## What has to change for oddlytrue.ai

### 1. Serve the frontend and backend from one origin
Serve `frontend/public/` as static files, and run the Express app as a Vercel Function under `/api`. A minimal sketch:

```ts
// api/[...path].ts (sketch)
import { createApp } from '../backend/src/app';
const app = createApp();
export default (req, res) => { req.url = req.url.replace(/^\/api/, ''); return app(req, res); };
```

Then set `API_BASE = '/api'` in `common.js`. With one origin, CORS isn't needed.

Check how ChatGPT Sites exposes Vercel Functions, routes and rewrites. I haven't verified that.

### 2. Make the question storage work on Vercel
**This is required, not optional.** `JsonDb` (`backend/src/db.ts`) saves new questions by writing to `services.json` on disk. On Vercel the bundled file is read-only and the function file system doesn't persist between requests. Choose one:
- **Read-only (simplest):** keep the GET routes, serve them from the bundled `services.json`, and drop or keep disabled the POST route.
- **Editable:** write a new `QuestionRepository` (the interface in `db.ts`) backed by a real store, such as Vercel Postgres, KV or Blob, or whatever oddlytrue.ai already uses. Seed it from `services.json`.

`JsonDb` already caches in memory, so read-only mode costs only one file read per cold start.

### 3. Update CI
In `.github/workflows/deploy-pi.yml`, keep the `test` job (install, build, test, validate questions). Remove the `deploy` job, which SSHes to the Pi, or replace it with the oddlytrue.ai deploy. Merging to `main` currently triggers the Pi deploy.

### 4. Clean up after the move
- Update `README.md`, which still describes the Pi setup and the old `app.js -> route.js` layout.
- Remove the raspberrynode.com addresses from `common.js` and `app.ts`.
- Delete the Pi secrets from GitHub: `PI_*` and `CF_ACCESS_*`.

## Run both locally (to check before deploying)
```bash
cd backend && npm ci && npm run build && PORT=5000 node dist/index.js   # API
cd frontend && npm ci && node app.js                                     # site on :4000
```
On macOS, the AirPlay Receiver uses port 5000. Turn it off, or run the API on another port and change `API_BASE`.

Already checked: a headless Chrome run against both local servers passed. It covered home, play, answer feedback, the results review, "Retry missed", high scores, the empty-category error, and a 375px mobile layout.

## Open product notes
- Eleven categories have only 1–2 questions (for example blockchain, game_tech, satellite). Consider merging them into broader groups.
- High scores live only in each browser's `localStorage`. If you want a shared leaderboard, it needs a backend store and server-side validation.
