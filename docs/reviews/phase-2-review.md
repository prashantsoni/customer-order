# Phase 2 Review: Storage layer

Model(s) used: Claude Haiku 5.5 | Date: 2026-10-11

## Scope

Phase P2 covers the storage layer: `src/js/storage/` (schema, store, customer and order repositories, app storage factory), the flaky-storage test helper, and the storage tests in `tests/storage/`.

Requirements in scope: FR-04, FR-13, FR-14, FR-15, NFR-06, NFR-08.

Scope note: FR-13, FR-14 and FR-15 are covered here at the storage level only. Their visible banners (`role="status"` recovery notice and `role="alert"` blocked-save notice) are UI work and remain in P3.

## Gate

| Check | Result |
|-------|--------|
| `npm test` (bare `node --test`) | Exit 0. 106 passed, 0 failed. 37 new tests: 14 store, 10 customer-repository, 13 order-repository. |
| `npm run check` | Exit 0. 17 files passed. |
| Manual spot check | `localStorage` appears only in `src/js/storage/index.js` (comment and default parameter) and the composition root. `src/js/domain/defaults.js` uses `crypto.randomUUID()` and `new Date()` as production defaults, which is allowed. No `innerHTML`, `Date.now` or `Math.random` in the checked paths. |

## Findings fixed

* `tests/helpers/builders.js`: `CREATED_AT` was not exported. Three test files failed on import. Fixed by exporting the constant.
* `src/js/storage/store.js`: the `scripts/check.js` bare-word `document` check flagged comments and error strings at lines 17, 52, 53 and 124. Reworded to "saved state" and "saved record". The malformed-write message was reworded to "malformed saved data".
* `canDeleteCustomer` renamed to `customerDeletionImpact` in P2. It returns a cascade list, not a block, to match D-06.

## Findings deferred

* Test-command drift: `AGENTS.md` line 11, `.github/instructions/tests.instructions.md` line 12, and `docs/decisions/2026-10-11-node-test-runner.md` line 37 still show a directory argument to `node --test`. Node 24 rejects it. Needs a user decision before editing instruction files.
* `scripts/check.js` uses a bare-word regex for `document`, `window` and `on*=`. It matches comments and strings, and `on[a-z]+=` can false-positive on `.one =`. Tighten in a later phase.
* D-16 (`emailMax` 254 and the phone rule), D-17 and D-18 are marked "Builder to confirm". The new D-31 record is also inferred.

## AI output corrected by me

* The P1 review note claimed "dead code: all exports used" without checking. That was verified with grep and reworded.
* The first draft of the storage code used the word `document` in comments, which tripped the static guard. Reworded.

## Checklist A: Code quality

* Domain purity: domain has no storage or DOM code. Passed.
* Layering: `scripts/check.js` import rules pass for all 17 files. Passed.
* Money: integer cents only. `formatCents` is render-only. Passed.
* IDs and clocks injected (`newId`, `now`). Passed.
* Repositories take an injected store, so tests use fake storage. Passed.
* Each write is a single `setItem`. Passed.
* Test quality: fresh fake storage per test and full result shapes asserted. Gap: no test asserts that inputs are not mutated. Deferred to P3, where UI tests will use the same helpers.

## Checklist B: Security

* No `innerHTML` in storage, tests or helpers. Passed.
* Corrupt or unreadable data is backed up and not rendered. Passed.
* Persistence is plain JSON by decision D-09, with no secrets stored. Accepted as a risk (D-09).
* No `eval`, `new Function`, `fetch` or console calls in the storage layer. Enforced by `scripts/check.js`, which passed. Passed.

## Coverage

| Requirement | Status after P2 | Evidence |
|-------------|-----------------|----------|
| FR-04 | Pending (P3 UI) | `customer-repository.test.js` remove cascade tests |
| FR-13 | Pending (P3 UI) | `store.test.js` round trip; `order-repository.test.js` fresh-instance persistence |
| FR-14 | Pending (P3 UI) | `store.test.js` recovery tests and `dismissRecovery` |
| FR-15 | Pending (P3 UI) | `store.test.js` quota and lock tests |
| NFR-06 | Pending | D-09 accepted; no dedicated test |
| NFR-08 | Pending (P6) | `store.test.js` backup key and reset; no export (D-08) |

## Follow-up

* Record D-31 in `docs/decisions/2026-10-11-storage-recovery-rules.md` (done in this phase; builder to confirm).
* P3 (app shell and customer UI) needs user approval before it starts.

## Overall status

Complete for P2 storage scope. Ready to close P2. UI banners and their evidence move to P3.
