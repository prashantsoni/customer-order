# Phase 7 review

Model(s) used: Claude Haiku 5.5 | Date: 2026-10-12
Scope: DR-01, DR-02, DR-03, NFR-03, NFR-04, NFR-05, NFR-06, NFR-08 (coverage rows in the implementation plan); full-repo run and security pass
Gate: tests pass (`npm test`: tests 128, pass 128, fail 0, exit 0; canonical `npm run test:e2e`: `desktop-chromium`, `desktop-webkit`, `phone-360` 111 passed; `desktop-firefox --workers=1` 37 passed; exit 0) | check pass (`npm run check`: check passed, 33 file(s) in src/, exit 0) | quality (Checklist A) pass on the responsive table fix and its e2e regression test, plus the focus-restoration changes; no dead code or new dependency found | security pass (no new user-data rendering path; prior whole-codebase pass remains valid) | requirements pass (NFR-04 and NFR-05 complete)
Findings fixed:
* P1 padded-query trimming had no test. Added `searchCustomers` and `filterOrders` trimming tests in `tests/domain/search.test.js`; both pass.
* Order table text fragmented at narrow widths. Added a minimum table width and non-wrapping headers; the table scrolls inside its named region on narrow screens. The regression test checks header line layout at 320, 360, 768 and 1280 px.
* Completed the six PRD journeys in the browser: customer creation, Draft order creation, adding a line and verifying the derived total, confirming and cancelling, and reload persistence.
* User confirmed manual verification of 200% and 400% zoom reflow, a screen-reader pass, and actual Windows High Contrast; NFR-04 is complete.
* README was stale: Status said code and tests were not written; Getting Started installed Chromium only; Testing said browser tests were Chromium only and `tests/e2e/` was not written; Folder Structure marked `tests/e2e/` as planned; the architecture diagram named `canDeleteCustomer`, which is now `customerDeletionImpact`. All updated in `README.md`.
* P6 review note (`docs/reviews/phase-6-review.md`) still said Firefox was awaiting a decision and that e2e was not clean. Updated to cite D-36 and this session's split run; earlier-session values are labelled as earlier.
* NFR-05: the canonical cross-browser run passed 111 tests across Chromium, WebKit, and phone, then 37 Firefox tests with one worker. Standalone Firefox also passed 37 tests with default workers and 74 tests over two repetitions. Earlier full parallel-run failures were not reproduced; D-36 remains the conservative canonical configuration.
* Playwright's server port was occupied and `serve` silently selected another port, causing connection-refused failures. Added `--no-port-switching` to the `start` script; the canonical e2e run passed with the app bound to port 5173.
Findings deferred:
* The cause of the historical cross-project parallel Firefox failures remains unknown. Standalone parallel Firefox and the canonical serialized Firefox stage pass; retain D-36 and revisit only if the failure reproduces.
* `aria-labelledby` on the dialog is optional (D-32); not applied.
* `scripts/check.js` has a `.one =` false positive.
* `scripts/check.js` scans `src/` only, so `tests/` is not covered by the static check.
* Render time measures the synchronous search handler only (input event to DOM update). It does not measure keystroke-to-paint latency.
AI output corrected by me: None recorded for P7.
Decisions added: none. P7 status: Closed (2026-10-12).
