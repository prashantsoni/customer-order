import { newId, nowIso } from "./defaults.js";
import { validateLine } from "./order-line.js";
import { fail, ok } from "./result.js";

export const ORDER_STATUS = Object.freeze({
  DRAFT: "Draft",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
});

export const ORDER_STATUSES = Object.freeze(Object.values(ORDER_STATUS));

const TRANSITIONS = Object.freeze({
  [ORDER_STATUS.DRAFT]: [ORDER_STATUS.CONFIRMED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CANCELLED]: [],
});

const DRAFT_ONLY_MESSAGE = "Only Draft orders can change their lines";

// Derived on every call, never stored. Integer cents only.
export function orderTotalCents(order) {
  return order.lines.reduce((sum, line) => sum + line.quantity * line.unitPriceCents, 0);
}

export function createOrder(input, { newId: makeId = newId, now = nowIso } = {}) {
  const source = input ?? {};
  const errors = {};
  const customerId = typeof source.customerId === "string" ? source.customerId.trim() : "";
  if (customerId === "") {
    errors.customerId = "Choose a customer";
  }

  const lineInputs = Array.isArray(source.lines) ? source.lines : [];
  if (lineInputs.length === 0) {
    errors.lines = "Add at least one line";
  }

  const lines = [];
  lineInputs.forEach((lineInput, index) => {
    const checked = validateLine(lineInput);
    if (checked.ok) {
      lines.push(checked.value);
    } else {
      for (const [field, message] of Object.entries(checked.errors)) {
        errors[`lines.${index}.${field}`] = message;
      }
    }
  });

  if (Object.keys(errors).length > 0) {
    return fail(errors);
  }
  const stamp = now();
  return ok({
    id: makeId(),
    customerId,
    status: ORDER_STATUS.DRAFT,
    createdAt: stamp,
    updatedAt: stamp,
    lines: lines.map((line) => ({ id: makeId(), ...line })),
  });
}

export function addLine(order, input, { newId: makeId = newId, now = nowIso } = {}) {
  if (order.status !== ORDER_STATUS.DRAFT) {
    return fail({ status: DRAFT_ONLY_MESSAGE });
  }
  const checked = validateLine(input);
  if (!checked.ok) {
    return checked;
  }
  return ok({ ...order, lines: [...order.lines, { id: makeId(), ...checked.value }], updatedAt: now() });
}

export function updateLine(order, lineId, input, { now = nowIso } = {}) {
  if (order.status !== ORDER_STATUS.DRAFT) {
    return fail({ status: DRAFT_ONLY_MESSAGE });
  }
  if (!order.lines.some((line) => line.id === lineId)) {
    return fail({ line: "Line not found" });
  }
  const checked = validateLine(input);
  if (!checked.ok) {
    return checked;
  }
  const lines = order.lines.map((line) => (line.id === lineId ? { ...line, ...checked.value } : line));
  return ok({ ...order, lines, updatedAt: now() });
}

export function removeLine(order, lineId, { now = nowIso } = {}) {
  if (order.status !== ORDER_STATUS.DRAFT) {
    return fail({ status: DRAFT_ONLY_MESSAGE });
  }
  if (!order.lines.some((line) => line.id === lineId)) {
    return fail({ line: "Line not found" });
  }
  if (order.lines.length === 1) {
    return fail({ lines: "An order needs at least one line" });
  }
  return ok({ ...order, lines: order.lines.filter((line) => line.id !== lineId), updatedAt: now() });
}

function moveTo(order, next, now) {
  if (!TRANSITIONS[order.status].includes(next)) {
    return fail({ status: `An order cannot move from ${order.status} to ${next}` });
  }
  return ok({ ...order, status: next, updatedAt: now() });
}

export function confirmOrder(order, { now = nowIso } = {}) {
  if (order.lines.length === 0) {
    return fail({ lines: "An order needs at least one line" });
  }
  return moveTo(order, ORDER_STATUS.CONFIRMED, now);
}

export function cancelOrder(order, { now = nowIso } = {}) {
  return moveTo(order, ORDER_STATUS.CANCELLED, now);
}

// Only Draft orders are removed. Confirmed orders are cancelled and kept for history.
export function canDeleteOrder(order) {
  if (order.status !== ORDER_STATUS.DRAFT) {
    return fail({ status: "Only Draft orders can be deleted. Cancel a Confirmed order instead" });
  }
  return ok({ id: order.id });
}
