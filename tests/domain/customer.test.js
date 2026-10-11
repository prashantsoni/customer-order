import { test } from "node:test";
import assert from "node:assert/strict";
import {
  customerDeletionImpact,
  createCustomer,
  isEmailTaken,
  updateCustomer,
  validateCustomer,
} from "../../src/js/domain/customer.js";
import { makeCustomer } from "../helpers/builders.js";

const CREATED = "2026-10-11T09:00:00.000Z";
const LATER = "2026-10-11T10:00:00.000Z";
const deps = { newId: () => "cust-new", now: () => LATER };

test("validateCustomer trims fields and stores absent email and phone as null", () => {
  const result = validateCustomer({ name: "  Ada  ", email: "  ", phone: "" });
  assert.deepEqual(result, { ok: true, value: { name: "Ada", email: null, phone: null } });
});

test("validateCustomer accepts a valid email and phone", () => {
  const result = validateCustomer({ name: "Ada", email: "ada@example.com", phone: "+1 (555) 010-9999" });
  assert.deepEqual(result, {
    ok: true,
    value: { name: "Ada", email: "ada@example.com", phone: "+1 (555) 010-9999" },
  });
});

test("validateCustomer requires a name and rejects whitespace-only names", () => {
  assert.deepEqual(validateCustomer({ name: "   " }), { ok: false, errors: { name: "Enter a name" } });
  assert.deepEqual(validateCustomer({}), { ok: false, errors: { name: "Enter a name" } });
});

test("validateCustomer accepts a 100 character name and rejects 101", () => {
  assert.equal(validateCustomer({ name: "a".repeat(100) }).ok, true);
  assert.deepEqual(validateCustomer({ name: "a".repeat(101) }), {
    ok: false,
    errors: { name: "Name must be 100 characters or fewer" },
  });
});

test("validateCustomer rejects a malformed email", () => {
  for (const email of ["ada", "ada@", "@example.com", "ada@example", "a b@example.com"]) {
    assert.deepEqual(
      validateCustomer({ name: "Ada", email }),
      { ok: false, errors: { email: "Enter a valid email address" } },
      email,
    );
  }
});

test("validateCustomer rejects an email already used by another customer, ignoring case", () => {
  const customers = [makeCustomer({ id: "cust-1", email: "ada@example.com" })];
  assert.deepEqual(validateCustomer({ name: "Grace", email: "ADA@Example.com" }, { customers }), {
    ok: false,
    errors: { email: "Another customer already uses this email" },
  });
});

test("validateCustomer lets a customer keep their own email when editing", () => {
  const customers = [makeCustomer({ id: "cust-1", email: "ada@example.com" })];
  const result = validateCustomer({ name: "Ada", email: "ada@example.com" }, { customers, ownId: "cust-1" });
  assert.equal(result.ok, true);
});

test("validateCustomer rejects a phone with invalid characters or over 30 characters", () => {
  assert.deepEqual(validateCustomer({ name: "Ada", phone: "555-abc" }), {
    ok: false,
    errors: { phone: "Phone can use digits, spaces and + - ( ) . only" },
  });
  assert.deepEqual(validateCustomer({ name: "Ada", phone: "1".repeat(31) }), {
    ok: false,
    errors: { phone: "Phone must be 30 characters or fewer" },
  });
  assert.equal(validateCustomer({ name: "Ada", phone: "1".repeat(30) }).ok, true);
});

test("validateCustomer reports every invalid field at once", () => {
  const result = validateCustomer({ name: "", email: "bad", phone: "x" });
  assert.deepEqual(Object.keys(result.errors).sort(), ["email", "name", "phone"]);
});

test("isEmailTaken is case-insensitive and ignores the customer's own id", () => {
  const customers = [makeCustomer({ id: "cust-1", email: "Ada@Example.com" })];
  assert.equal(isEmailTaken(customers, "ada@example.com"), true);
  assert.equal(isEmailTaken(customers, "ada@example.com", "cust-1"), false);
  assert.equal(isEmailTaken(customers, "grace@example.com"), false);
  assert.equal(isEmailTaken(customers, ""), false);
  assert.equal(isEmailTaken(customers, null), false);
});

test("createCustomer sets id and both timestamps from injected dependencies", () => {
  const result = createCustomer({ name: "Ada", email: "ada@example.com" }, deps);
  assert.deepEqual(result, {
    ok: true,
    value: {
      id: "cust-new",
      name: "Ada",
      email: "ada@example.com",
      phone: null,
      createdAt: LATER,
      updatedAt: LATER,
    },
  });
});

test("createCustomer returns validation errors and does not build a customer", () => {
  assert.deepEqual(createCustomer({ name: "" }, deps), { ok: false, errors: { name: "Enter a name" } });
});

test("createCustomer does not mutate the frozen customers list", () => {
  const customers = Object.freeze([makeCustomer({ id: "cust-1", email: "ada@example.com" })]);
  const result = createCustomer({ name: "Grace", email: "grace@example.com" }, { ...deps, customers });
  assert.equal(result.ok, true);
  assert.equal(customers.length, 1);
});

test("updateCustomer keeps id and createdAt and updates updatedAt", () => {
  const customer = makeCustomer({ id: "cust-1", createdAt: CREATED, updatedAt: CREATED });
  const result = updateCustomer(customer, { name: "Ada King", email: "ada@example.com", phone: null }, deps);
  assert.deepEqual(result, {
    ok: true,
    value: { ...customer, name: "Ada King", updatedAt: LATER },
  });
});

test("updateCustomer does not count the customer's own email as a duplicate", () => {
  const customer = makeCustomer({ id: "cust-1", email: "ada@example.com" });
  const customers = [customer];
  assert.equal(updateCustomer(customer, { name: "Ada", email: "ADA@example.com" }, { ...deps, customers }).ok, true);
});

test("updateCustomer rejects an email used by a different customer", () => {
  const customer = makeCustomer({ id: "cust-1", email: "ada@example.com" });
  const other = makeCustomer({ id: "cust-2", email: "grace@example.com" });
  assert.deepEqual(
    updateCustomer(customer, { name: "Ada", email: "grace@example.com" }, { ...deps, customers: [customer, other] }),
    { ok: false, errors: { email: "Another customer already uses this email" } },
  );
});

test("updateCustomer does not mutate a frozen customer", () => {
  const customer = Object.freeze(makeCustomer({ id: "cust-1" }));
  const result = updateCustomer(customer, { name: "Changed" }, deps);
  assert.equal(result.value.name, "Changed");
  assert.equal(customer.name, "Ada Lovelace");
});

test("canDeleteCustomer lists only the orders of that customer", () => {
  const orders = [
    { id: "order-1", customerId: "cust-1" },
    { id: "order-2", customerId: "cust-2" },
    { id: "order-3", customerId: "cust-1" },
  ];
  assert.deepEqual(customerDeletionImpact("cust-1", orders), { ok: true, value: { orderIds: ["order-1", "order-3"] } });
});

test("canDeleteCustomer reports zero orders for a customer with none", () => {
  assert.deepEqual(customerDeletionImpact("cust-9", []), { ok: true, value: { orderIds: [] } });
});
