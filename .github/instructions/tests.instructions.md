---
description: "Use when writing, changing or reviewing tests: node:test, assertions, test files, fixtures, fake storage, coverage of domain and storage modules, edge cases, regression tests, running npm test."
applyTo: "tests/**"
---
# Test Guidelines

Complements [AGENTS.md](../../AGENTS.md); domain-specific required cases are in [domain.instructions.md](domain.instructions.md).

## Tooling

* Use only `node:test` and `node:assert/strict`. No test frameworks, mocking libraries or other dependencies.
* Run with `npm test` (`node --test`). Tests must pass on Node 20 or later with no browser and no network.
* Tests cover `src/js/domain/` and `src/js/storage/`. Do not import from `src/js/ui/` or touch `document`, `window` or the real `localStorage`.

## Layout and naming

* Mirror the source tree: `src/js/domain/order.js` is tested by `tests/domain/order.test.js`; storage modules go in `tests/storage/`.
* One `describe` per exported function or behaviour is optional; flat `test()` calls are fine. Name tests as behaviour, for example `"rejects a negative unit price"`, not `"test1"` or `"works"`.
* Shared builders live in `tests/helpers/` (for example `makeCustomer`, `makeOrder`, `makeLine`, `createFakeStorage`). Do not copy fixtures between files.

## Determinism

* Inject `id` generators and clocks into the code under test. Tests never call `crypto.randomUUID()`, `Date.now()` or `Math.random()` for expected values.
* Build inputs with the helpers and override only the fields the test is about, so each test shows what matters.
* Tests are independent: no shared mutable state between tests and no reliance on execution order. Create fresh fake storage per test.

## Storage tests

* Pass an in-memory fake that implements `getItem`, `setItem` and `removeItem` into repositories; never patch globals.
* Cover: empty storage, a save and load round trip, corrupt JSON, a missing or unknown `schemaVersion`, and a storage object that throws on `setItem` (quota). Corrupt or missing data must not throw out of the repository.
* Assert on what was persisted: stored order data contains `lines` and no stored total.

## Assertions

* Use `assert.equal`, `assert.deepEqual` and `assert.throws` from the strict module. Do not use `assert.ok(a === b)` for comparisons.
* Validators return `{ ok, value }` or `{ ok: false, errors }`; assert the whole shape, including the field key and message, not only `ok`.
* For pure functions, also assert the input was not mutated (deep-copy or freeze the input with `Object.freeze` before the call).
* Money assertions use integer cents. Never compare formatted strings in domain tests.

## What to cover

* Every exported function change has a matching test; a bug fix starts with a failing regression test.
* Include the happy path plus boundaries: zero, empty, one, many; the largest realistic cent values; whitespace-only strings; mixed-case and padded search queries; unknown IDs.
* Do not test private helpers directly or assert on implementation details such as call counts. Test behaviour through the exported API.
* Do not add tests that only restate the code, and do not weaken or delete a failing test to get green; fix the code or record why the expectation changed in `docs/decisions/`.

## Example

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { orderTotalCents } from "../../src/js/domain/order.js";
import { makeLine } from "../helpers/builders.js";

test("sums quantity times unit price across lines", () => {
  const order = Object.freeze({
    lines: [makeLine({ quantity: 2, unitPriceCents: 150 }), makeLine({ quantity: 1, unitPriceCents: 99 })],
  });
  assert.equal(orderTotalCents(order), 399);
});
```
