# AWS Service Quiz

A static practice quiz with 290 service and acronym questions. Students choose a category and round length, get answer feedback, review results, retry missed questions, and save browser-local scores.

## Preview

```sh
npm run build
npm run preview
```

Open http://127.0.0.1:4173. Build and preview need Node and Python 3; no runtime npm packages or API server are required. `dist/` is the complete deployment artifact. Serve it over HTTP, not `file://`. Paths are relative so it can also live at `/aws-quiz/`.

The source of truth is `backend/services.json`. The build validates and copies this bank to `dist/questions.json`; it never uses the stale backups or generator output. All questions and answers are intentionally public practice material, not a secure examination system.

## Checks

```sh
npm ci
npm test
npx playwright install chromium
npm run test:e2e
npm ci --prefix backend
npm run build --prefix backend
npm test --prefix backend -- --runInBand
```

On a Mac with Chrome already installed, use `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e`. Browser tests start and stop their own loopback server. CI runs checks only, including browser tests; it has no Pi deployment or automatic production release.

## Browser storage

Scores stay in the current browser; there is no shared leaderboard. Storage keys are prefixed `awsQuiz:` to avoid conflicts with other oddlytrue.ai tools. Old scores at the Pi domain do not transfer to a different origin. If storage getters or writes fail, in-document navigation preserves the round, review, retry and scores in memory. A visible notice explains that reload/close loses that temporary data. No player data is sent to a server or put in URLs.

## Retained teaching API

The Express/TypeScript API remains in `backend/src` for separate local API exercises. It is **not** included in the static site's deployment. Run `npm run build --prefix backend`, then `PORT=5001 npm start --prefix backend` (macOS may reserve port 5000).

- `GET /categories`
- `GET /learn/:category`
- `POST /learn/:category`, requiring `Authorization: Bearer <ADMIN_API_KEY>`; disabled if no key is configured.

POST accepts `question`, `answer`, and a string-array `distractors`. It writes to the configured JSON file (`SERVICES_FILE`), which requires a persistent writable host. Never put the admin key in frontend code. `CORS_ORIGINS` remains configurable with the teaching API’s existing defaults. The static game never calls this API.

Paul previously used a sandbox where students added questions while learning APIs. Its current deployment and continued need have not been verified. This migration preserves the code but does not replace that hosted sandbox; decide its future separately before retiring the Pi/API service. No public write endpoint has been added.

## Hosting status

The student game is published at https://www.oddlytrue.ai/aws-quiz/ and linked from Projects. OddlyTrue Site version 91 contains the tested static build. The Pi and teaching API remain untouched. This repository branch is prepared for review only; do not merge while the old main-branch Pi deployment remains active. See `docs/HOSTING.md` for details.

The original frontend was inspired by https://github.com/jamesqquick/Build-A-Quiz-App-With-HTML-CSS-and-JavaScript. Original video overview: https://www.screencast.com/t/fb2EgPdK.
