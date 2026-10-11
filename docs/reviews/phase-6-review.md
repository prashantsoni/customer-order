# Phase 6 review

Model(s) used: Claude Haiku 5.5 | Date: 2026-10-12
Scope: NFR-01, NFR-07, NFR-08, O-03 (volume and regression evidence); NFR-05 cross-browser check partial (see Test counts)
Gate: tests pass for unit (126 pass, 0 fail); e2e pass with Firefox capped to one worker (D-36; split run in P7, see Test counts) | check pass (`npm run check`: check passed, 33 file(s) in src/) | quality pass (Checklist A, 1 finding fixed; re-run after the focus fix on 2026-10-12, 1 more finding fixed) | security pass (Checklist B, no findings; re-run after the focus fix on 2026-10-12) | requirements pass for NFR-01 and NFR-07; NFR-05 Partial (see deferred)
Findings fixed:
* Volume e2e first draft expected 64 results for "Linus"; the correct count is 62 (first name "Linus" matches 62 of 500 customers). Fixed in `tests/e2e/volume.spec.js`.
* Volume render time was recorded as a test annotation, which does not print in console output. Changed to `console.log` so the raw value is visible.
* Checklist A: `VOLUME_CUSTOMERS` and `VOLUME_ORDERS` in `tests/helpers/volume.js` were exported but unused elsewhere. Export removed; the constants stay internal.
* WebKit focus defect: three WebKit tests failed (`accessibility.spec.js:39` Escape closes the confirm dialog; `accessibility.spec.js:65` Cancel on the line form; `customers.spec.js:94` delete customer after confirmation). Cause: WebKit does not focus a button on click, so `document.activeElement` at open time was `body`, and the confirm dialog relied on native `<dialog>` focus restore, which WebKit does not provide. Fix: the opener is passed explicitly (`event.currentTarget`) in `src/js/ui/components/confirm-dialog.js`, `src/js/ui/views/customer-detail.js`, and `src/js/ui/views/order-detail.js`; the `close` listener restores focus to the opener. Reruns after the fix: the two accessibility tests 2 passed; WebKit alone 35 passed, 0 failed; WebKit `--repeat-each=2` 70 passed, 0 failed.
Checklist A (quality) on the P6 diff: layering holds (test-only files, no `src/` change); no dead code after the fix; names describe behaviour; files are small; no new dependency.
Checklist B (security) on the P6 diff: no `innerHTML`, `eval`, or inline handlers in the P6 files; the e2e spec writes only test data through `localStorage` and reads no user text; console output is limited to render time and project name; the seed holds synthetic data only (`user<i>@example.com`, fictional phone range).
Re-run after the focus fix (2026-10-12; `confirm-dialog.js`, `customer-detail.js`, `order-detail.js`): Checklist A: no dead code; the `opener` is set per open and cleared on close; the `close` listener checks `isConnected`; one comment in `order-detail.js` restated the code and was removed (1 finding, fixed); no new dependency. Checklist B: no `innerHTML`, `insertAdjacentHTML`, `eval`, or `new Function` in the three files; the dialog message is set with `textContent`; no new user text is rendered; no findings. Unit `npm test`: 126 pass, 0 fail. `npm run check`: check passed, 33 file(s) in src/. Both ran after the comment removal.
Findings deferred:
* Cross-browser run (NFR-05): Firefox (`firefox-1555`, Firefox 157.0) and WebKit (`webkit-2370`, WebKit 27.2) are installed in the local Playwright cache, and `playwright.config.js` has a `desktop-firefox` and `desktop-webkit` project. Firefox is unstable under the default parallel run (see Test counts). Decided: Firefox runs alone with one worker (D-36). The cause of the parallel failure is not verified. NFR-05 stays Partial.
* Unexplained: a background WebKit run after the focus fix (terminal `c480e408-05f9-4447-a198-307ebe75ed78`) reported the same three focus failures. Not reproduced in the WebKit reruns listed under Test counts, nor in the three full four-project runs (WebKit 0 failures in each), nor in the re-run on 2026-10-12 (35 passed, 0 failed, exit 0). An earlier WebKit run in the node terminal (`npx playwright test --project=desktop-webkit --workers=1`) exited 1; its output was not captured. Cause not known.
* Render time measures the synchronous search handler only (input event to DOM update). It does not measure keystroke-to-paint latency.
* Generated sample is not a worst case. Lines per order are not capped by the schema; the sample uses 1 to 3 lines per order.
* `scripts/check.js` scans `src/` only, so `tests/` is not covered by the static check.
* Width 320 px, previously untested in the P4 note, is covered by the P7 responsive e2e matrix.
AI output corrected by me: The first e2e draft had the wrong expected count (64 instead of 62) for "Linus". Corrected by checking the seed rule (`i % 8 == 7`) against the expected count before re-running.
Decisions added: D-35 (`docs/decisions/2026-10-12-focus-restoration-webkit.md`), D-36 (`docs/decisions/2026-10-12-firefox-single-worker.md`). D-28 (`docs/decisions/2026-10-11-volume-assumption.md`) updated with measured values.

## Measured values

Raw values from the earlier P6 run, not re-measured in P7 (`node --test tests/domain/search-volume.test.js`, tests 4, pass 4, fail 0 at that run). Sample: 500 customers, 5,000 orders, generated by `tests/helpers/volume.js`. E2E render values come from the e2e runs listed under Test counts.

| Measure | Value | Limit or target |
|---------|-------|-----------------|
| Serialized document size | 1,777,055 bytes (chars = bytes, ASCII only) | 5,242,880 bytes (5 MiB test limit), about 34% |
| `searchCustomers` "" (500 results) | 0.066 ms | 300 ms |
| `searchCustomers` "hopper" (64 results) | 0.441 ms | 300 ms |
| `searchCustomers` "zzz-no-match" (0 results) | 0.178 ms | 300 ms |
| `filterOrders` All (5000 results) | 0.543 ms | 300 ms |
| `filterOrders` Draft (1667 results) | 0.532 ms | 300 ms |
| `filterOrders` name "hopper" (640 results) | 1.262 ms | 300 ms |
| `filterOrders` Cancelled + "hopper" (213 results) | 0.555 ms | 300 ms |
| E2E search render, desktop-chromium ("Linus", 62 results) | 1.500 ms (final run); 1.500 ms (volume-only run) | 300 ms |
| E2E search render, phone-360 ("Linus", 62 results) | 1.700 ms (final run), 1.800 ms (volume-only run), 1.700 ms (full run 1) | 300 ms |
| E2E search render, desktop-firefox ("Linus", full run 1) | 3.000 ms | 300 ms |
| E2E search render, desktop-webkit ("Linus", full run 1) | 6.000 ms | 300 ms |

## Test counts

* P7 split run after the responsive table fix (2026-10-12): `npm test` tests 128, pass 128, fail 0, exit 0. `npm run check`: check passed, 33 file(s) in src/, exit 0. `npm run test:e2e`: `desktop-chromium`, `desktop-webkit`, `phone-360` 111 passed; `desktop-firefox --workers=1` 37 passed; exit 0.
* Unit (`npm test`) in P6: tests 126, suites 1, pass 126, fail 0, cancelled 0, skipped 0, todo 0.
* Volume unit file (`node --test tests/domain/search-volume.test.js`): tests 4, pass 4, fail 0.
* E2E (`npm run test:e2e`, four projects, 140 tests, default parallel workers):
  * Run 1: 139 passed, 1 failed (2.0m). The failure is `desktop-firefox` `accessibility.spec.js:76` (1280px). The test body passed; teardown `browserContext.close` exceeded 30000 ms.
  * Run 2: 130 passed, 10 failed (3.2m). All 10 failures are `desktop-firefox`. Failure reasons were not captured.
  * Run 3: 128 passed, 12 failed (3.4m). All 12 failures are `desktop-firefox`. Reasons: teardown `browserContext.close` timeouts; `expect(locator).toBeVisible()` failed (2); `page.reload` 30000 ms timeout (1). Firefox logs show `connector for namespace "page" ... is disposed`.
  * `desktop-chromium`, `desktop-webkit`, and `phone-360`: 0 failures in all three runs.
* Firefox alone (`npx playwright test --project=desktop-firefox --workers=1`): 35 passed (2.1m).
* WebKit alone, after the focus fix (`npx playwright test --project=desktop-webkit --workers=1`): 35 passed, 0 failed. WebKit with `--repeat-each=2`: 70 passed, 0 failed. Re-run on 2026-10-12 after the comment removal: 35 passed, 0 failed (44.2s, exit 0).

## Requirement evidence

* NFR-01: `tests/domain/search-volume.test.js` (timings above); `tests/e2e/volume.spec.js` (render time in both projects).
* NFR-07: serialized size measured against the 5 MiB test limit (`search-volume.test.js`, `t.diagnostic`).
* O-03: closed in P6. The volume seed is exercised by `search-volume.test.js` and `volume.spec.js` at 500 customers and 5,000 orders.
* NFR-08: coverage row Done in the plan (no export, D-08; volume evidence above).
* NFR-05: `desktop-chromium`, `desktop-webkit`, and `phone-360` had 0 failures in all three full runs. `desktop-firefox` passed alone (35 passed) and failed in the parallel full runs (1, 10, and 12 failures). NFR-05 stays Partial. Firefox runs alone with one worker (D-36); the parallel failure is not fixed.
