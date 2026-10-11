import { test } from "node:test";
import assert from "node:assert/strict";
import { filterOrders, searchCustomers } from "../../src/js/domain/search.js";
import { makeVolumeDocument } from "../helpers/volume.js";

// NFR-01 target: results within 300 ms at 500 customers and 5,000 orders.
const SEARCH_BUDGET_MS = 300;
// NFR-07: localStorage allows about 5 MB per origin.
const STORAGE_LIMIT_BYTES = 5 * 1024 * 1024;

const doc = makeVolumeDocument();
// Freeze the input arrays so any mutation by search code would throw.
const customers = Object.freeze(doc.customers);
const orders = Object.freeze(doc.orders);

function timed(fn) {
  const start = performance.now();
  const result = fn();
  return { result, ms: performance.now() - start };
}

test("volume seed has 500 customers and 5,000 orders", () => {
  assert.equal(customers.length, 500);
  assert.equal(orders.length, 5000);
});

test("searchCustomers at 500 customers stays within the 300 ms budget", (t) => {
  for (const query of ["", "hopper", "zzz-no-match"]) {
    const { result, ms } = timed(() => searchCustomers(customers, query));
    t.diagnostic(`searchCustomers query="${query}" results=${result.length} ms=${ms.toFixed(3)}`);
    assert.ok(ms < SEARCH_BUDGET_MS, `query "${query}" took ${ms.toFixed(3)} ms`);
  }
  // 8 surnames cycle over 500 customers; "Hopper" is one of them, so 64 match.
  assert.equal(searchCustomers(customers, "hopper").length, 64);
});

test("filterOrders at 5,000 orders stays within the 300 ms budget", (t) => {
  const cases = [
    { label: "All, empty query", options: {} },
    { label: "Draft", options: { status: "Draft" } },
    { label: "name hopper", options: { query: "hopper" } },
    { label: "Cancelled + hopper", options: { status: "Cancelled", query: "hopper" } },
  ];
  for (const { label, options } of cases) {
    const { result, ms } = timed(() => filterOrders(orders, customers, options));
    t.diagnostic(`filterOrders ${label} results=${result.length} ms=${ms.toFixed(3)}`);
    assert.ok(ms < SEARCH_BUDGET_MS, `${label} took ${ms.toFixed(3)} ms`);
  }
  assert.equal(filterOrders(orders, customers, { status: "Draft" }).length, 1667);
  // 64 matching customers with 10 orders each.
  assert.equal(filterOrders(orders, customers, { query: "hopper" }).length, 640);
});

test("serialized volume document is recorded and stays under the 5 MB storage limit", (t) => {
  const json = JSON.stringify(doc);
  const chars = json.length;
  const bytes = Buffer.byteLength(json, "utf8");
  t.diagnostic(`serialized chars=${chars} bytes=${bytes} limit=${STORAGE_LIMIT_BYTES}`);
  assert.ok(bytes < STORAGE_LIMIT_BYTES, `serialized size ${bytes} bytes exceeds ${STORAGE_LIMIT_BYTES}`);
});
