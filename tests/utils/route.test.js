import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { parseRoute } from "../../src/js/utils/route.js";

describe("parseRoute", () => {
  test("customer list routes", () => {
    assert.deepEqual(parseRoute("#/customers"), { name: "customers", id: null });
    assert.deepEqual(parseRoute("#/customers/"), { name: "customers", id: null });
  });

  test("customer detail route keeps the id", () => {
    assert.deepEqual(parseRoute("#/customers/abc-123"), { name: "customer", id: "abc-123" });
  });

  test("decodes an encoded id", () => {
    assert.deepEqual(parseRoute("#/customers/a%20b"), { name: "customer", id: "a b" });
  });

  test("empty, root and unknown routes fall back to the customer list", () => {
    assert.deepEqual(parseRoute(""), { name: "customers", id: null });
    assert.deepEqual(parseRoute("#"), { name: "customers", id: null });
    assert.deepEqual(parseRoute("#/"), { name: "customers", id: null });
    assert.deepEqual(parseRoute("#/unknown"), { name: "customers", id: null });
    assert.deepEqual(parseRoute("#/customers/a/b"), { name: "customers", id: null });
  });

  test("malformed percent-encoding falls back to the customer list", () => {
    assert.deepEqual(parseRoute("#/customers/%E0%A4%A"), { name: "customers", id: null });
  });

  test("non-string input falls back to the customer list", () => {
    assert.deepEqual(parseRoute(undefined), { name: "customers", id: null });
    assert.deepEqual(parseRoute(null), { name: "customers", id: null });
  });

  test("order list and new order routes", () => {
    assert.deepEqual(parseRoute("#/orders"), { name: "orders", id: null });
    assert.deepEqual(parseRoute("#/orders/"), { name: "orders", id: null });
    assert.deepEqual(parseRoute("#/orders/new"), { name: "order-new", id: null });
  });

  test("order detail route keeps the id and decodes it", () => {
    assert.deepEqual(parseRoute("#/orders/ord-1"), { name: "order", id: "ord-1" });
    assert.deepEqual(parseRoute("#/orders/a%20b"), { name: "order", id: "a b" });
  });

  test("unknown order sub-routes and malformed order ids fall back to the customer list", () => {
    assert.deepEqual(parseRoute("#/orders/a/b"), { name: "customers", id: null });
    assert.deepEqual(parseRoute("#/orders/%E0%A4%A"), { name: "customers", id: null });
  });
});
