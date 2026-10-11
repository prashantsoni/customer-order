import { test } from "node:test";
import assert from "node:assert/strict";
import { STORAGE_KEY, STORAGE_ERROR_MESSAGE } from "../../src/js/storage/schema.js";
import { createStore } from "../../src/js/storage/store.js";
import { createCustomerRepository } from "../../src/js/storage/customer-repository.js";
import { createFakeStorage, createFlakyStorage } from "../helpers/fake-storage.js";
import { CREATED_AT, makeCustomer, makeOrder } from "../helpers/builders.js";

function counter(prefix) {
  let n = 0;
  return () => `${prefix}-${++n}`;
}

function seed(customers = [], orders = []) {
  return createFakeStorage({ [STORAGE_KEY]: JSON.stringify({ schemaVersion: 1, customers, orders }) });
}

function setup(storage, clock = () => CREATED_AT) {
  const store = createStore({ storage, now: clock });
  const repo = createCustomerRepository({ store, newId: counter("cust"), now: clock });
  return { store, repo };
}

const ADA = { name: "Ada Lovelace", email: "ada@example.com", phone: "" };

test("save creates a customer with an id, timestamps and null phone", () => {
  const { repo } = setup(createFakeStorage());

  assert.deepEqual(repo.save(ADA), {
    ok: true,
    value: {
      id: "cust-1",
      name: "Ada Lovelace",
      email: "ada@example.com",
      phone: null,
      createdAt: CREATED_AT,
      updatedAt: CREATED_AT,
    },
  });
  assert.equal(repo.list().length, 1);
});

test("save rejects a duplicate email and stores nothing new", () => {
  const { repo } = setup(seed([makeCustomer({ id: "cust-1", email: "ada@example.com" })]));

  assert.deepEqual(repo.save({ name: "Other", email: "ADA@example.com", phone: "" }), {
    ok: false,
    errors: { email: "Another customer already uses this email" },
  });
  assert.equal(repo.list().length, 1);
});

test("update keeps id and createdAt and moves updatedAt forward", () => {
  let stamp = CREATED_AT;
  const { repo } = setup(seed([makeCustomer({ id: "cust-1", email: "ada@example.com" })]), () => stamp);
  stamp = "2026-10-12T10:00:00.000Z";

  const result = repo.save({ name: "Ada King", email: "ada@example.com", phone: "" }, { id: "cust-1" });

  assert.deepEqual(result, {
    ok: true,
    value: {
      id: "cust-1",
      name: "Ada King",
      email: "ada@example.com",
      phone: null,
      createdAt: CREATED_AT,
      updatedAt: "2026-10-12T10:00:00.000Z",
    },
  });
});

test("update of an unknown customer fails", () => {
  const { repo } = setup(seed());
  assert.deepEqual(repo.save(ADA, { id: "missing" }), { ok: false, errors: { id: "Customer not found" } });
});

test("remove deletes the customer and their orders in exactly one write", () => {
  const base = seed(
    [makeCustomer({ id: "cust-1" }), makeCustomer({ id: "cust-2", name: "Grace", email: "grace@example.com" })],
    [
      makeOrder({ id: "order-1", customerId: "cust-1" }),
      makeOrder({ id: "order-2", customerId: "cust-1" }),
      makeOrder({ id: "order-3", customerId: "cust-2" }),
    ],
  );
  const storage = createFlakyStorage(base, () => false);
  const { repo } = setup(storage);

  assert.deepEqual(repo.remove("cust-1"), { ok: true, value: { removedOrderCount: 2 } });
  assert.deepEqual(storage.writes, [STORAGE_KEY]);
  assert.deepEqual(repo.list().map((c) => c.id), ["cust-2"]);
  assert.deepEqual(
    repo.deletionImpact("cust-2"),
    { ok: true, value: { orderIds: ["order-3"] } },
  );
});

test("a failed delete removes neither the customer nor the orders", () => {
  const base = seed([makeCustomer({ id: "cust-1" })], [makeOrder({ id: "order-1", customerId: "cust-1" })]);
  const { repo } = setup(createFlakyStorage(base, () => true));

  assert.deepEqual(repo.remove("cust-1"), { ok: false, errors: { storage: STORAGE_ERROR_MESSAGE } });
  assert.equal(repo.list().length, 1);
  assert.equal(repo.get("cust-1").id, "cust-1");
});

test("removing an unknown customer fails", () => {
  const { repo } = setup(seed());
  assert.deepEqual(repo.remove("missing"), { ok: false, errors: { id: "Customer not found" } });
});

test("deleting a customer with no orders reports zero removed orders", () => {
  const { repo } = setup(seed([makeCustomer({ id: "cust-1" })]));
  assert.deepEqual(repo.deletionImpact("cust-1"), { ok: true, value: { orderIds: [] } });
  assert.deepEqual(repo.remove("cust-1"), { ok: true, value: { removedOrderCount: 0 } });
  assert.deepEqual(repo.list(), []);
});

test("a save that hits a storage quota error returns the storage message", () => {
  const base = seed();
  const { repo } = setup(createFlakyStorage(base, () => true));

  assert.deepEqual(repo.save(ADA), { ok: false, errors: { storage: STORAGE_ERROR_MESSAGE } });
  assert.deepEqual(base.getItem(STORAGE_KEY), JSON.stringify({ schemaVersion: 1, customers: [], orders: [] }));
});

test("get returns null for an unknown id", () => {
  const { repo } = setup(seed([makeCustomer({ id: "cust-1" })]));
  assert.equal(repo.get("missing"), null);
  assert.equal(repo.get("cust-1").id, "cust-1");
});
