import { LIMITS } from "../utils/config.js";
import { newId, nowIso } from "./defaults.js";
import { fail, ok } from "./result.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\-(). ]+$/;

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

// Case-insensitive. A customer whose id equals ownId does not count as a duplicate.
export function isEmailTaken(customers, email, ownId = null) {
  const wanted = text(email).toLowerCase();
  if (wanted === "") {
    return false;
  }
  return customers.some((customer) => customer.id !== ownId && text(customer.email).toLowerCase() === wanted);
}

export function validateCustomer(input, { customers = [], ownId = null } = {}) {
  const source = input ?? {};
  const name = text(source.name);
  const email = text(source.email);
  const phone = text(source.phone);
  const errors = {};

  if (name === "") {
    errors.name = "Enter a name";
  } else if (name.length > LIMITS.customerNameMax) {
    errors.name = `Name must be ${LIMITS.customerNameMax} characters or fewer`;
  }

  if (email !== "") {
    if (email.length > LIMITS.emailMax) {
      errors.email = `Email must be ${LIMITS.emailMax} characters or fewer`;
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.email = "Enter a valid email address";
    } else if (isEmailTaken(customers, email, ownId)) {
      errors.email = "Another customer already uses this email";
    }
  }

  if (phone !== "") {
    if (phone.length > LIMITS.phoneMax) {
      errors.phone = `Phone must be ${LIMITS.phoneMax} characters or fewer`;
    } else if (!PHONE_PATTERN.test(phone)) {
      errors.phone = "Phone can use digits, spaces and + - ( ) . only";
    }
  }

  if (Object.keys(errors).length > 0) {
    return fail(errors);
  }
  return ok({ name, email: email || null, phone: phone || null });
}

export function createCustomer(input, { customers = [], newId: makeId = newId, now = nowIso } = {}) {
  const checked = validateCustomer(input, { customers });
  if (!checked.ok) {
    return checked;
  }
  const stamp = now();
  return ok({ id: makeId(), ...checked.value, createdAt: stamp, updatedAt: stamp });
}

export function updateCustomer(customer, input, { customers = [], now = nowIso } = {}) {
  const checked = validateCustomer(input, { customers, ownId: customer.id });
  if (!checked.ok) {
    return checked;
  }
  return ok({ ...customer, ...checked.value, updatedAt: now() });
}

// Deleting a customer cascades to their orders (see customer-deletion-cascade decision).
// Returns the order ids that the caller must remove in the same save.
export function customerDeletionImpact(customerId, orders = []) {
  const orderIds = orders.filter((order) => order.customerId === customerId).map((order) => order.id);
  return ok({ orderIds });
}
