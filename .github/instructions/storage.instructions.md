---
description: "Use when writing or changing storage code: localStorage repositories, persistence, schemaVersion, migrations, corrupt or missing JSON handling, injected storage, fake storage for tests."
applyTo: "src/js/storage/**"
---
# Storage Layer Guidelines

Complements [AGENTS.md](../../AGENTS.md); do not repeat its architecture rules here.

## Boundaries

* This is the only layer that touches `localStorage`. Never reference the global directly in a repository; take a storage object (`getItem`, `setItem`, `removeItem`) as a parameter, defaulting to `globalThis.localStorage` only at the composition root.
* Import only from `domain/` and `utils/`. No DOM, `document` or `fetch`.
* Repositories do not validate or compute business rules; call domain validators and totals instead.

## Persisted shape

* Store one JSON document per key under a namespaced key (for example `customer-order:v1`) shaped `{ schemaVersion, customers, orders }`.
* Order lines stay embedded in `order.lines[]`; never persist totals or other derived values.
* Money is integer cents; IDs come from `crypto.randomUUID()` (injectable for tests).
* Bump `schemaVersion` on any shape change and add a migration from the previous version, with a test.

## Reading

* Wrap `JSON.parse` in `try/catch`. Missing key, invalid JSON, wrong type or unknown/newer `schemaVersion` must return an empty default state, never throw into the UI.
* Do not silently overwrite corrupt data: keep the raw value under a backup key (for example `customer-order:corrupt-<timestamp>`) before resetting, and surface a flag the UI can show.
* Return copies, not references to cached internal state.

## Writing

* Writes are read-modify-write of the whole document and must not mutate inputs.
* Catch `setItem` failures (quota, private mode) and return `{ ok: false, errors: { storage: "message" } }`; do not throw for runtime storage errors.
* Enforce referential integrity: refuse to save an order whose `customerId` does not exist, and delete or block per the domain `customerDeletionImpact` rule so no orphan orders remain.

## Tests

* Use `node:test`, `node:assert/strict` and an in-memory fake storage in `tests/storage/`; never rely on a real `localStorage`.
* Cover: empty storage, corrupt JSON, wrong `schemaVersion`, migration, save/load round trip, quota error, orphan order rejection, customer delete with orders.

```js
export function createFakeStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => void data.set(k, String(v)),
    removeItem: (k) => void data.delete(k),
  };
}
```
