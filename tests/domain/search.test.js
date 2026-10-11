import { test } from "node:test";
import assert from "node:assert/strict";
import { filterOrders, ORDER_STATUS_FILTERS, searchCustomers } from "../../src/js/domain/search.js";
import { makeCustomer, makeOrder } from "../helpers/builders.js";

const ada = makeCustomer({ id: "cust-1", name: "Ada Lovelace", email: "ada@example.com" });
const grace = makeCustomer({ id: "cust-2", name: "Grace Hopper", email: null });
const customers = [ada, grace];

test("searchCustomers with an empty query returns every customer in order", () => {
  assert.deepEqual(searchCustomers(customers, ""), [ada, grace]);
  assert.deepEqual(searchCustomers(customers, "   "), [ada, grace]);
  assert.deepEqual(searchCustomers(customers, undefined), [ada, grace]);
});

test("searchCustomers matches part of name or email, ignoring case", () => {
  assert.deepEqual(searchCustomers(customers, "LOVE"), [ada]);
  assert.deepEqual(searchCustomers(customers, "hopper"), [grace]);
  assert.deepEqual(searchCustomers(customers, "EXAMPLE.COM"), [ada]);
});

test("searchCustomers trims leading and trailing whitespace from the query", () => {
  assert.deepEqual(searchCustomers(customers, "  LOVE  "), [ada]);
  assert.deepEqual(searchCustomers(customers, "\thopper\n"), [grace]);
});

test("searchCustomers returns an empty list when nothing matches", () => {
  assert.deepEqual(searchCustomers(customers, "nobody"), []);
});

test("searchCustomers tolerates a null email and does not throw", () => {
  assert.deepEqual(searchCustomers([grace], "@"), []);
});

test("searchCustomers does not mutate a frozen customers list", () => {
  const frozen = Object.freeze([ada, grace]);
  const result = searchCustomers(frozen, "");
  result.pop();
  assert.equal(frozen.length, 2);
});

const draft = makeOrder({ id: "o-1", customerId: "cust-1", status: "Draft" });
const confirmed = makeOrder({ id: "o-2", customerId: "cust-2", status: "Confirmed" });
const cancelled = makeOrder({ id: "o-3", customerId: "cust-1", status: "Cancelled" });
const orders = [draft, confirmed, cancelled];

test("filterOrders with All and an empty query returns every order", () => {
  assert.deepEqual(filterOrders(orders, customers), orders);
  assert.deepEqual(filterOrders(orders, customers, { status: "All", query: "" }), orders);
});

test("filterOrders filters by each status", () => {
  assert.deepEqual(filterOrders(orders, customers, { status: "Draft" }), [draft]);
  assert.deepEqual(filterOrders(orders, customers, { status: "Confirmed" }), [confirmed]);
  assert.deepEqual(filterOrders(orders, customers, { status: "Cancelled" }), [cancelled]);
});

test("filterOrders searches by customer name, ignoring case and matching part of a value", () => {
  assert.deepEqual(filterOrders(orders, customers, { query: "ADA" }), [draft, cancelled]);
  assert.deepEqual(filterOrders(orders, customers, { query: "hopp" }), [confirmed]);
});

test("filterOrders trims leading and trailing whitespace from the name query", () => {
  assert.deepEqual(filterOrders(orders, customers, { query: "  hopp  " }), [confirmed]);
});

test("filterOrders combines status and name, so every result matches both", () => {
  assert.deepEqual(filterOrders(orders, customers, { status: "Cancelled", query: "ada" }), [cancelled]);
  assert.deepEqual(filterOrders(orders, customers, { status: "Confirmed", query: "ada" }), []);
});

test("filterOrders returns an empty list when nothing matches", () => {
  assert.deepEqual(filterOrders(orders, customers, { query: "zzz" }), []);
});

test("filterOrders returns an empty list for an unknown status", () => {
  assert.deepEqual(filterOrders(orders, customers, { status: "Shipped" }), []);
});

test("filterOrders does not match an order whose customer is missing", () => {
  const orphan = makeOrder({ id: "o-9", customerId: "cust-gone", status: "Draft" });
  assert.deepEqual(filterOrders([orphan], customers, { query: "a" }), []);
  assert.deepEqual(filterOrders([orphan], customers), [orphan]);
});

test("ORDER_STATUS_FILTERS lists All followed by the three statuses", () => {
  assert.deepEqual([...ORDER_STATUS_FILTERS], ["All", "Draft", "Confirmed", "Cancelled"]);
});
