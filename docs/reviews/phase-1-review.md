# Phase 1 review
Model(s) used: Claude Haiku 5.5 | Date: 2026-10-11
Scope: FR-01, FR-03, FR-04 (domain rule), FR-05, FR-06, FR-07, FR-08, FR-09, FR-10, FR-12, NFR-02, DR-02 (domain tests)
Gate: tests pass (69 of 69) | check pass (12 files in src/) | quality pass | security pass | requirements pass (domain scope; UI parts tracked in P3 and P4)
Findings fixed:
* Test inputs for `addLine` used `makeLine({ id: undefined })`. Replaced with plain line objects.
* One test name overstated its check (float drift). Renamed to "sums many lines exactly".
Findings deferred:
* `canDeleteCustomer` always returns `ok` and lists cascade order ids. The name reads like a gate. Rename to `customerDeletionImpact` in P2, when the storage delete path uses it. Reason: name is fixed by the P1 plan; no behaviour change needed now.
* `formatCents` accepts negative values. Domain rejects them, so the display path is safe. Tighten in P3 when UI calls it.
* `scripts/check.js` regex `on[a-z]+=` can match `.one =`. Known false positive; no current match in `src/`. Tighten the pattern in a later phase.
* Test-command doc drift: `AGENTS.md` line 11, `tests.instructions.md` line 12, and decision D-22 still say `node --test tests/`. The script is now `node --test` (Node 24 rejects directory arguments). Needs user OK for the instruction-file edit.
* Inferred limits `emailMax` 254 and phone character rule are not in GAP-05. Recorded as inferred in the validation-limits decision. Builder to confirm.
AI output corrected by me: Drafted `parsePriceToCents` and `validateLine` contract was checked against the PRD before tests. No defects were found in the module logic on first test run. The only corrections were the test-input and test-name points above.
Decisions added: D-16 amended (inferred email length and phone character rule). No new D-id.

## Checklist A: code quality
* Layering: `domain/` imports only `domain/` and `utils/`. Pass (checked by `npm run check`).
* Purity and injection: `newId` and `now` are injected with defaults in `defaults.js`. Inputs are not mutated; frozen-input tests cover customer, order, line, and list functions. Pass.
* Money: integer cents throughout; `parsePriceToCents` avoids float math. Pass.
* Errors: all functions return `{ ok, value }` or `{ ok: false, errors }`. User input does not throw. Pass.
* Size and dependencies: each module is under about 150 lines. No new dependency. Pass.
* Dead code: exports listed in `src/js/domain/` were reviewed; each is used by a domain module or a test. No commented-out code. Pass.

## Checklist B: security
* Forbidden APIs: none in `src/js/domain/`. Pass.
* Input bounds: length checks run before regex checks for email and phone, which limits regex cost. Pass.
* No DOM, no storage, no console output in domain. Pass.
* Price parsing of very long digit text returns the max error rather than an unsafe integer. Covered by a test. Pass.

## Coverage
| Requirement | Evidence (domain tests) |
|-------------|-------------------------|
| NFR-02      | `order.test.js` totals in integer cents; `order-line.test.js` `parsePriceToCents` cases |
| DR-02       | 69 domain tests across `tests/domain/` |
| FR-01, FR-03, FR-05 | `customer.test.js` validation and duplicate email tests |
| FR-06, FR-07, FR-08, FR-09, FR-10, FR-12 | `order.test.js` and `order-line.test.js` rule tests |

## Follow-up
* Confirm the test-command doc drift and the inferred limits (see Findings deferred).
