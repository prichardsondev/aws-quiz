# Hosting migration plan

## Recommendation

Use the static build as `/aws-quiz/` in the existing oddlytrue.ai Site, then link it from the site's appropriate learning/tools section. This avoids another origin, DNS changes, a public write API, database provisioning and a new hosting subscription. The existing Site was verified by Sites `get_site`: project `appgprj_6a9c44b9f7cc8191ac8ca5f83e24e6fb`, public, live URL https://oddlytrue.ai. Preserve that identity and audience.

ChatGPT Sites supports static output or Cloudflare Worker ES modules. It does **not** provide Vercel Functions. The handoff's Express-to-Vercel sketch is therefore inapplicable. Static hosting preserves the existing student-facing behavior; server hosting only becomes necessary for a separately requested shared leaderboard or writable teaching sandbox.

Sites' deployment URLs are production, including private Sites, so no Site deployment was used as a preview. A local preview and browser tests are the safe current verification stage.

## Existing-host integration, before publication

1. Reopen the current oddlytrue.ai source through Sites' source workflow, preserving the project ID and latest source. The Mac's oddlytrue.ai checkout declares itself a review preview and must not be assumed to be current production source.
2. Copy this branch's built `dist/` contents into the host's public asset directory at `aws-quiz/`; preserve `questions.json`, all four HTML pages, JS and CSS. Avoid rewriting these paths to the host's application shell. Verify the host's Worker/static routing and Content Security Policy allow the self-hosted script modules and fetches. Make the link point to `/aws-quiz/` (with trailing slash), not `/aws-quiz` unless the host redirects it.
3. Add one quiet `AWS quiz` link in the relevant learning/tools area, following the existing site's design guide. Preview the **integrated** host, not only the standalone quiz; run that repository's required build/lint/check and retained-route checks.
4. Independently disable the old GitHub `deploy-pi.yml` workflow before any main-branch merge. Verify it is disabled and inspect/cancel any pending deployment runs if authorized. Do not rely solely on a later merge to eliminate the deployment risk. This branch deletes that workflow and adds check-only CI.
5. Publish the reviewed host release only with the release gate satisfied. Verify student access without an owner session, all same-origin quiz requests, review/retry/scores, and the oddlytrue.ai link on the actual public URL.
6. Only then mark the draft PR ready and merge. Verify the merged workflow contains no SSH deployment. Do not retire the old API or delete Pi/Cloudflare secrets until Paul decides whether the separate API teaching sandbox is still needed and confirms rollback no longer needs them.

## Alternatives

A separate static Site can be linked from oddlytrue.ai without DNS changes, but it adds another Site and still requires production publication to obtain a live URL. Cloudflare Pages or GitHub Pages can also serve the same directory. They are fallbacks, not provisioned resources. GitHub Pages plan/repository eligibility and account-specific Cloudflare limits must be confirmed before choosing either; no promise of zero charges is made.

References checked 2026-11-17:
- https://developers.cloudflare.com/pages/platform/limits/
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

## Verification limits

The automated bank validator checks structure, duplicate options/questions, and its known obsolete-name list. Passing it is not a fresh factual audit of all AWS service descriptions. The API sandbox's current live status is unverified. No public endpoint was probed with a POST. No deployment, DNS change, billing action, workflow disablement, secret deletion or merge was performed during preparation.

## Local verification result

On 2026-11-17, the static build validated all 290 questions, three storage unit tests passed, all six Chrome browser scenarios passed, and the TypeScript backend build plus all 34 backend tests passed. Browser scenarios cover a five-question round, correct and incorrect feedback, automatic advance, keyboard answers, full/wrong-only review, retry missed, saving/filtering scores, normal/blocked/quota/corrupt storage, mobile overflow, short categories, direct page entry, back navigation, failed bank loading and retry, invalid category, corrupt retry data, and simulated subdirectory hosting. Browser flows asserted no uncaught page errors and no off-origin requests. Desktop home and mobile gameplay screenshots were inspected. The Playwright default browser binary was absent; tests used installed Chrome via `PLAYWRIGHT_CHANNEL=chrome`.

The separate `/Users/paulrichardson/Projects/code-review` checkout remains on `team/code-review` with its original modified `KICKOFF.md`. It was only read. No local Codex memories were present in the memories directory. The isolated migration starts from review commit `c362c92`.
