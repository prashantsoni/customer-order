# Phase 4 Review: Orders UI

Model(s) used: Claude Haiku 5.5 | Date: 2026-10-12

## Scope

Phase P4 covers the order UI: `src/js/ui/views/order-form.js`, `src/js/ui/views/order-detail.js`, `src/js/ui/views/orders.js`, the orders section in `src/js/ui/views/customer-detail.js` and the new spec `tests/e2e/orders.spec.js` (15 tests, run in both Playwright projects). Domain and storage code were not changed in P4.

Requirements in scope: FR-06 to FR-12, FR-16. Also closed here, as deferred from P3: FR-02 (order routes and customer orders), FR-04 (order-count path), FR-11 (customer orders section) and the FR-15 delete-failure browser path.

Scope note: FR-17 (responsive and accessibility hardening) is P5. P4 did not start P5.

## Gate

| Check | Result |
|-------|--------|
| `npm test` (bare `node --test`) | Exit 0. 122 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo. Counted from raw output. |
| `npm run check` | Exit 0. "check passed: 33 file(s) in src/". |
| `npm run test:e2e` | 52 passed, 0 failed (22 P3 tests plus 30 P4 tests; 15 P4 tests × 2 projects: `desktop-chromium`, `phone-360`). |

Unit count note: this review records 122 passing. P3 recorded 112. The 10-test difference was already in the workspace before the P4 e2e work and is not traced to a source in this review. Reconcile in P7.

## Findings fixed

* No UI defects were found by the e2e run; no source fixes were needed in P4.
* Coverage gap closed in this phase: the P3 review deferred a browser check for the customer delete-failure path. Added "keeps the customer and their orders when the customer delete cannot be saved" to `tests/e2e/orders.spec.js`. It passes in both projects.
* Coverage gap closed: "shows the not-found state for an unknown order id" covers the order route not-found view.

## Findings deferred

* Confirm has no confirmation dialog. The plan asks for confirmation on Cancel and Delete only. Confirm is one way ([D-03](../decisions/2026-10-11-order-status-one-way.md)). Recorded as an inferred choice in [D-33](../decisions/2026-10-12-p4-orders-ui.md) for builder review.
* FR-17 (P5): responsive and accessibility hardening, `scrollWidth` check at 360px, layout check at 320, 768 and 1280.
* NFR-01 and DR-02 performance and capacity (P6).
* Doc drift carried from P2 and P3, needs a user decision before editing instruction files:
  * `AGENTS.md` line 11, `.github/instructions/tests.instructions.md` line 12 and `docs/decisions/2026-10-11-node-test-runner.md` line 37 show a directory argument to `node --test`, which Node 24 rejects.
  * `.github/instructions/ui.instructions.md` names `canDeleteCustomer`; the code uses `customerDeletionImpact`.
* `src/js/utils/dom.js` allow-list now includes `aria-labelledby` and `scope` (done). The dialogs still use `aria-label` ([D-32](../decisions/2026-10-12-p3-ui-approach.md)).
* `scripts/check.js` false positives carried from P2: bare words in comments and strings; `\.on[a-z]+\s*=` matches `.one =`.
* Inferred decision records D-16, D-17, D-18, D-31, D-32 and D-33 need builder confirmation.
* No `.git` in the workspace, so no commit was made. The commit message is in the phase handover.

## AI output corrected by me

* The P4 UI code existed before this phase. It was checked by reading against the plan and not rewritten.
* Coverage evidence test titles were checked against the 15 titles in `tests/e2e/orders.spec.js` before the review was closed. No mismatches were found.

## Checklist A: Code quality

* Domain purity: totals come only from `orderTotalCents` via `formatCents`. Search and filter go through `filterOrders` and `searchCustomers`. Line input goes through `parseLineText`. No money parsing or totals arithmetic in `src/js/ui/**`. Passed.
* Layering: `scripts/check.js` passes for 33 files in `src/`. Passed.
* Views render from state and call domain or storage. Passed.
* Every list has an empty state and a no-results state (orders, customer orders). Passed.
* Every form has inline validation (`aria-invalid`, `aria-describedby`) and a form-level error state for save failures (order form, line form, order delete). Passed.
* Read-only Confirmed and Cancelled orders: no edit or remove controls rendered. Passed by e2e "confirms an order and keeps its lines read-only".
* Test quality: e2e tests assert visible text, roles and stored values, and reload persistence. Gap: no unit tests for views (covered by e2e only). Accepted for P4.

## Checklist B: Security

* User text rendered with `textContent` only. e2e probe "renders hostile customer and line text as plain text" passes. Passed.
* No `innerHTML`, `eval`, `new Function`, `document.write`, string timers, inline handlers, `console.` calls or `localStorage` in `src/js/ui/**`. Enforced by `scripts/check.js`, which passed. Passed.
* Save failures keep the entered values and show `role="alert"` (line save, order delete, customer delete). Passed by e2e.
* Stored data stays unencrypted by decision ([D-09](../decisions/2026-10-11-personal-data-unencrypted.md)). Accepted risk.

## Coverage

| Requirement | Status after P4 | Evidence |
|-------------|-----------------|----------|
| FR-02 | Done | e2e "lists a customer's orders on the customer detail page"; "shows the not-found state for an unknown order id" |
| FR-04 | Done | e2e "deleting a customer with orders states the order count and removes those orders"; "keeps the customer and their orders when the customer delete cannot be saved" |
| FR-06 | Done | e2e "creates a Draft order, shows the derived total and lists it"; "shows inline errors on the new order form and keeps entered values" |
| FR-07 | Done | e2e "adds, edits and removes lines and keeps the total in step"; "keeps entered line values when the line cannot be saved" |
| FR-08 | Done | e2e "creates a Draft order, shows the derived total and lists it"; "adds, edits and removes lines and keeps the total in step" |
| FR-09 | Done | e2e "adds, edits and removes lines and keeps the total in step"; "confirms an order and keeps its lines read-only" |
| FR-10 | Done | e2e "confirms an order and keeps its lines read-only"; "cancels a confirmed order only after confirmation" |
| FR-11 | Done | e2e "lists a customer's orders on the customer detail page" |
| FR-12 | Done | e2e "deletes a Draft only after confirmation"; "keeps a Draft when the delete cannot be saved" |
| FR-15 | Done | e2e "keeps a Draft when the delete cannot be saved"; "keeps the customer and their orders when the customer delete cannot be saved" |
| FR-16 | Done | e2e "shows empty states for orders and for the new order form without customers"; "filters by status and searches by customer name together" |
| FR-17 | Pending (P5) | Not in scope |
| NFR-01, DR-02 | Pending (P6) | Not in scope |

## Decision

[D-33](../decisions/2026-10-12-p4-orders-ui.md): P4 build choices (order form with first line, inline line editing, confirmation dialog for Confirm, combined status and customer filter). Confirm dialog added on owner decision; other choices inferred, builder to confirm. E2e: 54 pass (27 tests across two projects), including the Confirm-cancel test.

## Next

Phase P4 is closed. P5 is not started and waits for user approval.
