# Phase 0 review

Model(s) used: Claude Haiku 5.5 (single model for all P0 tasks) | Date: 2026-10-11
Scope: FR-18 (start and test commands), NFR-03 (CSP), DR-02 (guardrails), partial FR-18 and NFR-03 evidence for P0
Gate: tests pass (`npm test` exit 0, 0 tests so far) | check pass (`npm run check`: 6 files) | quality pass | security pass | requirements pass (partial, P3 closes FR-18) | decisions pass (one choice recorded below) | `npm start` pass (HTTP 200 for `/`, `css/main.css`, `js/main.js`, `js/utils/money.js`, `js/utils/dom.js`, `js/utils/config.js`)

## Checklist A: code quality

* Layering: `utils/` imports nothing outside `utils/`. No domain, storage or UI code yet. Pass.
* Money: integer cents in `config.js` and `formatCents`. `formatCents` rejects non-safe integers. Pass.
* Dead code: none. `builders.js` and `fake-storage.js` are unused until P1 and P2. Expected.
* Errors: `dom.js` throws `TypeError` only for programmer errors (unknown attribute name). User input does not reach it yet. Pass.
* Dependencies: none added. `package.json` has only `@playwright/test`. Pass.

## Checklist B: security

* No `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval`, `new Function`, `document.write`, inline handlers, inline script or style. Enforced by `scripts/check.js`. Pass.
* `dom.js` uses `textContent` for text children and an attribute allow-list. `href` is limited to `#/` targets. Pass.
* CSP meta is present and matches the policy that `scripts/check.js` requires. No external URL. Pass.
* No console output in `src/`. Pass.

## Findings fixed

* `npm test` was `node --test tests/`. Node 24 treats the argument as a module path and fails with "Cannot find module". Changed to `node --test`, which discovers `*.test.js` files and exits 0. Helpers in `tests/helpers/` do not match the discovery patterns. Also works on Node 20.

## Findings deferred

* `scripts/check.js` rule `.on[a-z]+=` can match an unusual assignment such as `.one =`. Low risk. Revisit if a false positive appears.
* `formatCents` accepts negative integers. Domain validation (P1) must reject negative prices and quantities.
* `LIMITS` in `config.js` are inferred from the validation-limits decision. Builder confirmation pending (D-16, GAP-05).
* Documentation still shows the old test command: [AGENTS.md](../../AGENTS.md) line 11, `.github/instructions/tests.instructions.md` line 12, and [docs/decisions/2026-10-11-node-test-runner.md](../decisions/2026-10-11-node-test-runner.md) line 37. Update these when confirmed.

## Decisions

* Test command changed from `node --test tests/` to `node --test` (Node 24 directory argument failure; globs need Node 21+ and `engines` is `>=20`). Recorded here. Confirm and update D-22 in `docs/plan/decision-tracker.md` before P1.

## AI output corrected by me

* The generated `npm test` script did not run on Node 24. Replaced the argument with default discovery and re-ran it (exit 0).

## Overall status

Closed. Deferred items are tracked above and do not block P1.
