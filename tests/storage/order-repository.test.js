import { test } from "node:test";
import assert from "node:assert/strict";
import { STORAGE_KEY, STORAGE_ERROR_MESSAGE } from "../../src/js/storage/schema.js";
import { createStore } from "../../src/js/storage/store.js";
import { createOrderRepository } from "../../src/js/storage/order-repository.js";
import { createAppStorage } from "../../src/js/storage/index.js";
import { createFakeStorage, createFlakyStorage } from "../helpers/fake-storage.js";
import { CREATED_AT, makeCustomer, makeLine, makeOrder } from "../helpers/builders.js";

function counter(prefix) {
  let n = 0;
  return () => `${prefix}-${++n}`;
}

const now = () => CREATED_AT;

function seed(customers = [makeCustomer({ id: "cust-1" })], orders = []) {
  return createFakeStorage({ [STORAGE_KEY]: JSON.stringify({ schemaVersion: 1, customers, orders }) });
}

function setup(storage) {
  const store = createStore({ storage, now });
  const repo = createOrderRepository({ store, newId: counter("id"), now });
  return { store, repo };
}

const WIDGET_LINE = { description: "Widget", quantity: 2, unitPriceCents: 150 };

test("create gives a Draft order with generated ids and timestamps", () => {
  const { repo } = setup(seed());

  assert.deepEqual(repo.create({ customerId: "cust-1", lines: [WIDGET_LINE] }), {
    ok: true,
    value: {
      id: "id-1",
      customerId: "cust-1",
      status: "Draft",
      createdAt: CREATED_AT,
      updatedAt: CREATED_AT,
      lines: [{ id: "id-2", description: "Widget", quantity: 2, unitPriceCents: 150 }],
    },
  });
});

test("the stored order keeps lines and has no stored total", () => {
  const storage = seed();
  const { repo } = setup(storage);
  repo.create({ customerId: "cust-1", lines: [WIDGET_LINE] });

  const saved = JSON.parse(storage.getItem(STORAGE_KEY));
  assert.equal(saved.orders.length, 1);
  assert.equal(Array.isArray(saved.orders[0].lines), true);
  assert.equal("total" in saved.orders[0], false);
  assert.equal("totalCents" in saved.orders[0], false);
});

test("create for an unknown customer fails and stores nothing", () => {
  const storage = seed();
  const { repo } = setup(storage);

  assert.deepEqual(repo.create({ customerId: "ghost", lines: [WIDGET_LINE] }), {
    ok: false,
    errors: { customerId: "Choose an existing customer" },
  });
  assert.deepEqual(repo.list(), []);
});

test("create with no lines fails with the lines message", () => {
  const { repo } = setup(seed());
  assert.deepEqual(repo.create({ customerId: "cust-1", lines: [] }), {
    ok: false,
    errors: { lines: "Add at least one line" },
  });
});

test("replace saves changed lines for an existing order", () => {
  const { repo } = setup(seed(undefined, [makeOrder({ id: "order-1", customerId: "cust-1" })]));
  const changed = makeOrder({
    id: "order-1",
    customerId: "cust-1",
    lines: [makeLine({ id: "line-9", quantity: 5 })],
  });

  assert.deepEqual(repo.replace(changed), { ok: true, value: changed });
  assert.deepEqual(repo.get("order-1").lines, [makeLine({ id: "line-9", quantity: 5 })]);
});

test("replace of an unknown order fails", () => {
  const { repo } = setup(seed());
  assert.deepEqual(repo.replace(makeOrder({ id: "missing" })), {
    ok: false,
    errors: { id: "Order not found" },
  });
});

test("replace to a missing customer fails and keeps the stored order", () => {
  const original = makeOrder({ id: "order-1", customerId: "cust-1" });
  const { repo } = setup(seed(undefined, [original]));

  assert.deepEqual(repo.replace(makeOrder({ id: "order-1", customerId: "ghost" })), {
    ok: false,
    errors: { customerId: "Choose an existing customer" },
  });
  assert.deepEqual(repo.get("order-1"), original);
});

test("removing a Confirmed order is refused and keeps it", () => {
  const confirmed = makeOrder({ id: "order-1", status: "Confirmed" });
  const { repo } = setup(seed(undefined, [confirmed]));

  assert.deepEqual(repo.remove("order-1"), {
    ok: false,
    errors: { status: "Only Draft orders can be deleted. Cancel a Confirmed order instead" },
  });
  assert.deepEqual(repo.get("order-1"), confirmed);
});

test("removing a Draft order deletes only that order", () => {
  const { repo } = setup(
    seed(undefined, [makeOrder({ id: "order-1" }), makeOrder({ id: "order-2" })]),
  );

  assert.deepEqual(repo.remove("order-1"), { ok: true, value: { id: "order-1" } });
  assert.deepEqual(repo.list().map((o) => o.id), ["order-2"]);
});

test("removing an unknown order fails", () => {
  const { repo } = setup(seed());
  assert.deepEqual(repo.remove("missing"), { ok: false, errors: { id: "Order not found" } });
});

test("listForCustomer returns only that customer's orders", () => {
  const { repo } = setup(
    seed(
      [makeCustomer({ id: "cust-1" }), makeCustomer({ id: "cust-2", name: "Grace", email: "grace@example.com" })],
      [
        makeOrder({ id: "order-1", customerId: "cust-1" }),
        makeOrder({ id: "order-2", customerId: "cust-2" }),
      ],
    ),
  );

  assert.deepEqual(repo.listForCustomer("cust-2").map((o) => o.id), ["order-2"]);
  assert.deepEqual(repo.listForCustomer("cust-3"), []);
});

test("a save that hits a storage quota error keeps the order out of storage", () => {
  const base = seed();
  const { repo } = setup(createFlakyStorage(base, () => true));

  assert.deepEqual(repo.create({ customerId: "cust-1", lines: [WIDGET_LINE] }), {
    ok: false,
    errors: { storage: STORAGE_ERROR_MESSAGE },
  });
  assert.deepEqual(repo.list(), []);
});

test("customers and orders survive a fresh createAppStorage on the same storage", () => {
  const storage = createFakeStorage();
  const first = createAppStorage({ storage, now, newId: counter("id") });

  const customer = first.customers.save({ name: "Ada Lovelace", email: "ada@example.com", phone: "" });
  assert.equal(customer.ok, true);
  const order = first.orders.create({ customerId: customer.value.id, lines: [WIDGET_LINE] });
  assert.equal(order.ok, true);

  const second = createAppStorage({ storage, now, newId: counter("again") });
  assert.deepEqual(second.customers.list(), [customer.value]);
  assert.deepEqual(second.orders.list(), [order.value]);
});
