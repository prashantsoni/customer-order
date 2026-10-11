import { nowIso } from "../domain/defaults.js";
import { fail, ok } from "../domain/result.js";
import {
  BACKUP_KEY_PREFIX,
  BLOCKED_MESSAGE,
  MIGRATIONS,
  SCHEMA_VERSION,
  STORAGE_ERROR_MESSAGE,
  STORAGE_KEY,
  emptyDocument,
  isWellFormedDocument,
} from "./schema.js";

const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);

// Parses raw text and upgrades it to schemaVersion one step at a time.
// Returns the saved state, or null when the data cannot be used.
function parseDocument(raw, schemaVersion, migrations) {
  let doc;
  try {
    doc = JSON.parse(raw);
  } catch {
    return null;
  }
  while (isObject(doc) && doc.schemaVersion !== schemaVersion) {
    const from = doc.schemaVersion;
    const step = Number.isInteger(from) && from < schemaVersion && Object.hasOwn(migrations, from)
      ? migrations[from]
      : null;
    if (typeof step !== "function") {
      return null;
    }
    const next = step(doc);
    if (!isObject(next) || !(next.schemaVersion > from)) {
      return null;
    }
    doc = next;
  }
  return isObject(doc) && doc.schemaVersion === schemaVersion && isWellFormedDocument(doc) ? doc : null;
}

function backupKeyFor(storage, now) {
  const stamp = now().replaceAll(":", "-").replaceAll(".", "-");
  const base = `${BACKUP_KEY_PREFIX}${stamp}`;
  let candidate = base;
  for (let n = 1; storage.getItem(candidate) !== null; n += 1) {
    candidate = `${base}-${n}`;
  }
  return candidate;
}

// Single gateway to the saved state. Every read returns fresh copies and every
// write replaces the whole saved record in one setItem call.
export function createStore({
  storage,
  key = STORAGE_KEY,
  schemaVersion = SCHEMA_VERSION,
  migrations = MIGRATIONS,
  now = nowIso,
} = {}) {
  let recovered = false;
  let backupKey = null;
  let locked = false;

  function backupAndReset(raw) {
    const target = backupKeyFor(storage, now);
    try {
      storage.setItem(target, raw);
    } catch {
      // The corrupt value is still in place. Refuse writes so it is not overwritten.
      locked = true;
      return emptyDocument(schemaVersion);
    }
    recovered = true;
    backupKey = target;
    try {
      storage.removeItem(key);
      locked = false;
    } catch {
      locked = true;
    }
    return emptyDocument(schemaVersion);
  }

  function readState() {
    let raw;
    try {
      raw = storage.getItem(key);
    } catch {
      locked = true;
      return emptyDocument(schemaVersion);
    }
    if (raw === null) {
      locked = false;
      return emptyDocument(schemaVersion);
    }
    const doc = parseDocument(raw, schemaVersion, migrations);
    if (doc !== null) {
      locked = false;
      return doc;
    }
    return backupAndReset(raw);
  }

  function read() {
    const { customers, orders } = readState();
    return { customers, orders };
  }

  // mutate(state) returns fail(errors) to abort without writing, or
  // ok({ customers, orders, result }) to save the new state and return result.
  function update(mutate) {
    const current = readState();
    if (locked) {
      return fail({ storage: BLOCKED_MESSAGE });
    }
    const outcome = mutate({ customers: current.customers, orders: current.orders });
    if (!outcome.ok) {
      return outcome;
    }
    const { customers, orders, result } = outcome.value;
    const next = { schemaVersion, customers, orders };
    if (!isWellFormedDocument(next)) {
      throw new Error("Refusing to write malformed saved data. This is a bug in a repository or domain rule.");
    }
    try {
      storage.setItem(key, JSON.stringify(next));
    } catch {
      return fail({ storage: STORAGE_ERROR_MESSAGE });
    }
    return ok(result);
  }

  function status() {
    return { recovered, backupKey, locked };
  }

  function dismissRecovery() {
    recovered = false;
    backupKey = null;
  }

  return { read, update, status, dismissRecovery };
}
