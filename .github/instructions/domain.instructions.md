---
description: "Use when writing or changing domain logic: customers, orders, order lines, validation, totals, search and filter. Covers purity rules, money handling, error shape and required tests."
applyTo: "src/js/domain/**"
---
# Domain Layer Guidelines

Complements [AGENTS.md](../../AGENTS.md); do not repeat its architecture rules here.

## Purity

* No DOM, `window`, `document`, `localStorage` or `fetch`. Import only from `domain/` and `utils/`.
* Functions are pure and do not mutate inputs; return new objects (`{ ...order, lines }`).
* Pass `id` generators and clocks in as parameters, defaulting to `crypto.randomUUID()` and `Date.now()`, so tests stay deterministic.

## Money

* Amounts are integer cents (`unitPriceCents`). Never use floats or `toFixed` in domain code.
* Reject non-integer or negative cents and non-positive integer quantities in validation.
* `orderTotalCents(order)` is the only place totals are computed; never persist a total.

## Validation

* Validators return `{ ok: true, value }` or `{ ok: false, errors: { field: "message" } }`; do not throw for user input.
* Trim strings before checking. Required: customer `name`, line `description`. Email, when present, must be well formed.
* Messages are user-facing text keyed by field so the UI can show them inline.

## Rules

* A customer cannot be removed while orders reference it; expose the check (for example `customerDeletionImpact`) and let the caller choose block or cascade.
* Search and filter functions are case-insensitive, trim the query, and return everything for an empty query.

## Tests

* Every exported function change needs a matching test in `tests/domain/` using `node:test` and `node:assert/strict`.
* Cover: empty order total, multiple lines, invalid quantity or price, whitespace-only names, empty search query.

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { orderTotalCents } from "../../src/js/domain/order.js";

test("empty order totals 0", () => {
  assert.equal(orderTotalCents({ lines: [] }), 0);
});
```
