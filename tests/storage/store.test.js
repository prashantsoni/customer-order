import { test } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../../src/js/domain/result.js";
import {
  BACKUP_KEY_PREFIX,
  BLOCKED_MESSAGE,
  STORAGE_ERROR_MESSAGE,
  STORAGE_KEY,
} from "../../src/js/storage/schema.js";
import { createStore } from "../../src/js/storage/store.js";
import { createFakeStorage, createFlakyStorage } from "../helpers/fake-storage.js";
import { CREATED_AT, makeCustomer, makeOrder } from "../helpers/builders.js";

const now = () => CREATED_AT;
const BACKUP_KEY = `${BACKUP_KEY_PREFIX}2026-10-11T09-00-00-000Z`;

function seeded(raw) {
  return createFakeStorage({ [STORAGE_KEY]: raw });
}

function savedDoc(customers = [], orders = []) {
  return JSON.stringify({ schemaVersion: 1, customers, orders });
}

test("missing data reads as empty with no recovery notice", () => {
  const store = createStore({ storage: createFakeStorage(), now });
  assert.deepEqual(store.read(), { customers: [], orders: [] });
  assert.deepEqual(store.status(), { recovered: false, backupKey: null, locked: false });
});

test("a saved update is read back, and reads return copies", () => {
  const storage = createFakeStorage();
  const store = createStore({ storage, now });
  const customer = makeCustomer();

  const result = store.update(({ orders }) => ok({ customers: [customer], orders, result: "saved" }));
  assert.deepEqual(result, { ok: true, value: "saved" });

  const first = store.read();
  assert.deepEqual(first, { customers: [customer], orders: [] });
  first.customers[0].name = "Changed in caller";
  assert.equal(store.read().customers[0].name, "Ada Lovelace");
});

test("corrupt JSON is backed up under a timestamped key and the main key is cleared", () => {
  const storage = seeded("{not json");
  const store = createStore({ storage, now });

  assert.deepEqual(store.read(), { customers: [], orders: [] });
  assert.equal(storage.getItem(STORAGE_KEY), null);
  assert.equal(storage.getItem(BACKUP_KEY), "{not json");
  assert.deepEqual(store.status(), { recovered: true, backupKey: BACKUP_KEY, locked: false });
});

test("an unsupported schemaVersion is backed up", () => {
  const storage = seeded(JSON.stringify({ schemaVersion: 99, customers: [], orders: [] }));
  const store = createStore({ storage, now });

  assert.deepEqual(store.read(), { customers: [], orders: [] });
  assert.equal(storage.getItem(STORAGE_KEY), null);
  assert.notEqual(storage.getItem(BACKUP_KEY), null);
  assert.equal(store.status().recovered, true);
});

test("a document with the wrong shape is backed up", () => {
  const storage = seeded(JSON.stringify({ schemaVersion: 1, customers: "nope", orders: [] }));
  const store = createStore({ storage, now });

  assert.deepEqual(store.read(), { customers: [], orders: [] });
  assert.equal(storage.getItem(BACKUP_KEY), JSON.stringify({ schemaVersion: 1, customers: "nope", orders: [] }));
});

test("an order that points at a missing customer is treated as corrupt", () => {
  const raw = savedDoc([], [makeOrder({ customerId: "ghost" })]);
  const storage = seeded(raw);
  const store = createStore({ storage, now });

  assert.deepEqual(store.read(), { customers: [], orders: [] });
  assert.equal(storage.getItem(BACKUP_KEY), raw);
});

test("a customer name over the length limit is treated as corrupt", () => {
  const raw = savedDoc([makeCustomer({ name: "x".repeat(101) })]);
  const storage = seeded(raw);
  const store = createStore({ storage, now });

  assert.deepEqual(store.read(), { customers: [], orders: [] });
  assert.equal(storage.getItem(BACKUP_KEY), raw);
});

test("a registered migration upgrades an older document", () => {
  const storage = seeded(JSON.stringify({ schemaVersion: 0, customers: [makeCustomer()], orders: [] }));
  const migrations = { 0: (doc) => ({ ...doc, schemaVersion: 1 }) };
  const store = createStore({ storage, now, migrations });

  assert.deepEqual(store.read().customers, [makeCustomer()]);
  assert.equal(store.status().recovered, false);
});

test("a migration that does not advance schemaVersion is rejected and the data is backed up", () => {
  const raw = JSON.stringify({ schemaVersion: 0, customers: [], orders: [] });
  const storage = seeded(raw);
  const migrations = { 0: (doc) => ({ ...doc, schemaVersion: 0 }) };
  const store = createStore({ storage, now, migrations });

  assert.deepEqual(store.read(), { customers: [], orders: [] });
  assert.equal(storage.getItem(BACKUP_KEY), raw);
});

test("a quota error on save returns the storage error and keeps the previous data", () => {
  const base = createFakeStorage({ [STORAGE_KEY]: savedDoc([makeCustomer()]) });
  const storage = createFlakyStorage(base, () => true);
  const store = createStore({ storage: base, now });
  const failing = createStore({ storage, now });

  const result = failing.update(({ customers, orders }) =>
    ok({ customers: [], orders, result: "cleared" }),
  );

  assert.deepEqual(result, { ok: false, errors: { storage: STORAGE_ERROR_MESSAGE } });
  assert.deepEqual(store.read().customers, [makeCustomer()]);
});

test("a failed backup keeps the corrupt value, locks writes, and reports the blocked message", () => {
  const raw = "{not json";
  const base = seeded(raw);
  const storage = createFlakyStorage(base, () => true);
  const store = createStore({ storage, now });

  assert.deepEqual(store.read(), { customers: [], orders: [] });
  assert.equal(base.getItem(STORAGE_KEY), raw);
  assert.equal(store.status().locked, true);

  const result = store.update(({ customers, orders }) => ok({ customers, orders, result: "x" }));
  assert.deepEqual(result, { ok: false, errors: { storage: BLOCKED_MESSAGE } });
  assert.equal(base.getItem(STORAGE_KEY), raw);
});

test("a read failure locks writes instead of throwing", () => {
  const storage = {
    getItem: () => {
      throw new Error("SecurityError");
    },
    setItem: () => {},
    removeItem: () => {},
  };
  const store = createStore({ storage, now });

  assert.deepEqual(store.read(), { customers: [], orders: [] });
  assert.equal(store.status().locked, true);
});

test("dismissRecovery clears the recovery notice", () => {
  const storage = seeded("{not json");
  const store = createStore({ storage, now });
  store.read();
  assert.equal(store.status().recovered, true);

  store.dismissRecovery();
  assert.deepEqual(store.status(), { recovered: false, backupKey: null, locked: false });
});

test("a second backup gets a unique key instead of overwriting the first", () => {
  const storage = createFakeStorage({ [STORAGE_KEY]: "{first", [BACKUP_KEY]: "{earlier" });
  const store = createStore({ storage, now });
  store.read();

  assert.equal(storage.getItem(BACKUP_KEY), "{earlier");
  assert.equal(storage.getItem(`${BACKUP_KEY}-1`), "{first");
  assert.equal(store.status().backupKey, `${BACKUP_KEY}-1`);
});
