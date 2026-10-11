import { ORDER_STATUSES } from "../domain/order.js";
import { LIMITS } from "../utils/config.js";

export const STORAGE_KEY = "customer-order:v1";
export const BACKUP_KEY_PREFIX = "customer-order:corrupt-";
export const SCHEMA_VERSION = 1;

// Migrations are keyed by the version they upgrade from: { 1: (doc) => doc at version 2 }.
export const MIGRATIONS = Object.freeze({});

export const STORAGE_ERROR_MESSAGE =
  "Could not save. Browser storage may be full or unavailable. Your entries are still on screen; try again.";
export const BLOCKED_MESSAGE =
  "Changes cannot be saved right now because saved data could not be read or backed up. Free some browser storage, then reload.";

export function emptyDocument(schemaVersion = SCHEMA_VERSION) {
  return { schemaVersion, customers: [], orders: [] };
}

const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const isId = (value) => typeof value === "string" && value.length > 0 && value.length <= 100;
const isText = (value, max) => typeof value === "string" && value.length <= max;
const isOptionalText = (value, max) => value === null || isText(value, max);
const isTimestamp = (value) => typeof value === "string" && value.length > 0;

function isCustomer(customer) {
  return (
    isObject(customer) &&
    isId(customer.id) &&
    isText(customer.name, LIMITS.customerNameMax) &&
    isOptionalText(customer.email, LIMITS.emailMax) &&
    isOptionalText(customer.phone, LIMITS.phoneMax) &&
    isTimestamp(customer.createdAt) &&
    isTimestamp(customer.updatedAt)
  );
}

function isLine(line) {
  return (
    isObject(line) &&
    isId(line.id) &&
    isText(line.description, LIMITS.lineDescriptionMax) &&
    Number.isSafeInteger(line.quantity) &&
    line.quantity >= LIMITS.quantityMin &&
    line.quantity <= LIMITS.quantityMax &&
    Number.isSafeInteger(line.unitPriceCents) &&
    line.unitPriceCents >= 0 &&
    line.unitPriceCents <= LIMITS.unitPriceMaxCents
  );
}

function isOrder(order) {
  return (
    isObject(order) &&
    isId(order.id) &&
    isId(order.customerId) &&
    ORDER_STATUSES.includes(order.status) &&
    isTimestamp(order.createdAt) &&
    isTimestamp(order.updatedAt) &&
    Array.isArray(order.lines) &&
    order.lines.length > 0 &&
    order.lines.every(isLine)
  );
}

// Checks shape, length caps, unique ids and that every order points at a stored customer.
// Data that fails any check is treated as corrupt.
export function isWellFormedDocument(doc) {
  if (!isObject(doc) || !Array.isArray(doc.customers) || !Array.isArray(doc.orders)) {
    return false;
  }
  if (!doc.customers.every(isCustomer) || !doc.orders.every(isOrder)) {
    return false;
  }
  const customerIds = new Set(doc.customers.map((customer) => customer.id));
  const orderIds = new Set(doc.orders.map((order) => order.id));
  if (customerIds.size !== doc.customers.length || orderIds.size !== doc.orders.length) {
    return false;
  }
  return doc.orders.every((order) => customerIds.has(order.customerId));
}
