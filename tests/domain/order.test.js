import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addLine,
  canDeleteOrder,
  cancelOrder,
  confirmOrder,
  createOrder,
  orderTotalCents,
  removeLine,
  updateLine,
} from "../../src/js/domain/order.js";
import { makeLine, makeOrder } from "../helpers/builders.js";

const LATER = "2026-10-11T10:00:00.000Z";
const deps = { newId: () => "id-new", now: () => LATER };
const DRAFT_ONLY = "Only Draft orders can change their lines";

function confirmedOrder() {
  return makeOrder({ status: "Confirmed" });
}

test("orderTotalCents sums quantity times unit price in integer cents", () => {
  const order = makeOrder({
    lines: [
      makeLine({ id: "a", quantity: 2, unitPriceCents: 1999 }),
      makeLine({ id: "b", quantity: 3, unitPriceCents: 5 }),
    ],
  });
  assert.equal(orderTotalCents(order), 4013);
});

test("orderTotalCents is zero for an order with no lines", () => {
  assert.equal(orderTotalCents(makeOrder({ lines: [] })), 0);
});

test("orderTotalCents sums many lines exactly", () => {
  const lines = Array.from({ length: 10 }, (_, i) => makeLine({ id: `l${i}`, quantity: 1, unitPriceCents: 10 }));
  assert.equal(orderTotalCents(makeOrder({ lines })), 100);
});

test("orderTotalCents is derived and not stored on the order", () => {
  const order = makeOrder({ lines: [makeLine({ quantity: 1, unitPriceCents: 100 })] });
  assert.equal(Object.hasOwn(order, "total"), false);
  assert.equal(Object.hasOwn(order, "totalCents"), false);
});

test("createOrder starts in Draft with injected id and timestamps", () => {
  const result = createOrder(
    { customerId: "cust-1", lines: [{ description: "Widget", quantity: 2, unitPriceCents: 500 }] },
    deps,
  );
  assert.deepEqual(result, {
    ok: true,
    value: {
      id: "id-new",
      customerId: "cust-1",
      status: "Draft",
      createdAt: LATER,
      updatedAt: LATER,
      lines: [{ id: "id-new", description: "Widget", quantity: 2, unitPriceCents: 500 }],
    },
  });
});

test("createOrder requires a customer", () => {
  const result = createOrder({ customerId: "  ", lines: [makeLine()] }, deps);
  assert.deepEqual(result, { ok: false, errors: { customerId: "Choose a customer" } });
});

test("createOrder requires at least one line", () => {
  assert.deepEqual(createOrder({ customerId: "cust-1", lines: [] }, deps), {
    ok: false,
    errors: { lines: "Add at least one line" },
  });
  assert.deepEqual(createOrder({ customerId: "cust-1" }, deps), {
    ok: false,
    errors: { lines: "Add at least one line" },
  });
});

test("createOrder reports line errors keyed by line index and field", () => {
  const result = createOrder(
    {
      customerId: "cust-1",
      lines: [
        { description: "Good", quantity: 1, unitPriceCents: 100 },
        { description: "", quantity: 0, unitPriceCents: 100 },
      ],
    },
    deps,
  );
  assert.deepEqual(result, {
    ok: false,
    errors: {
      "lines.1.description": "Enter a description",
      "lines.1.quantity": "Quantity must be a whole number from 1 to 9999",
    },
  });
});

test("addLine appends a validated line to a Draft order and updates updatedAt", () => {
  const order = makeOrder({ lines: [makeLine({ id: "line-1" })] });
  const result = addLine(order, { description: "Gadget", quantity: 3, unitPriceCents: 200 }, deps);
  assert.equal(result.ok, true);
  assert.deepEqual(result.value.lines.map((line) => line.id), ["line-1", "id-new"]);
  assert.equal(result.value.lines[1].description, "Gadget");
  assert.equal(result.value.updatedAt, LATER);
});

test("addLine returns line validation errors and leaves the order unchanged", () => {
  const order = makeOrder();
  const result = addLine(order, { description: "X", quantity: -1, unitPriceCents: 100 }, deps);
  assert.deepEqual(result, { ok: false, errors: { quantity: "Quantity must be a whole number from 1 to 9999" } });
  assert.equal(order.lines.length, 1);
});

test("addLine is blocked on Confirmed and Cancelled orders", () => {
  for (const status of ["Confirmed", "Cancelled"]) {
    const order = makeOrder({ status });
    assert.deepEqual(addLine(order, { description: "X", quantity: 1, unitPriceCents: 1 }, deps), {
      ok: false,
      errors: { status: DRAFT_ONLY },
    });
  }
});

test("updateLine changes a line in a Draft order and keeps its id", () => {
  const order = makeOrder({ lines: [makeLine({ id: "line-1", quantity: 1, unitPriceCents: 100 })] });
  const result = updateLine(order, "line-1", { description: "Widget", quantity: 4, unitPriceCents: 150 }, deps);
  assert.deepEqual(result.value.lines, [{ id: "line-1", description: "Widget", quantity: 4, unitPriceCents: 150 }]);
  assert.equal(orderTotalCents(result.value), 600);
  assert.equal(result.value.updatedAt, LATER);
});

test("updateLine reports an unknown line id", () => {
  assert.deepEqual(updateLine(makeOrder(), "missing", { description: "X", quantity: 1, unitPriceCents: 1 }, deps), {
    ok: false,
    errors: { line: "Line not found" },
  });
});

test("updateLine is blocked on Confirmed orders", () => {
  assert.deepEqual(
    updateLine(confirmedOrder(), "line-1", { description: "X", quantity: 1, unitPriceCents: 1 }, deps),
    { ok: false, errors: { status: DRAFT_ONLY } },
  );
});

test("removeLine removes a line from a Draft order with several lines", () => {
  const order = makeOrder({
    lines: [makeLine({ id: "line-1" }), makeLine({ id: "line-2", unitPriceCents: 300 })],
  });
  const result = removeLine(order, "line-1", deps);
  assert.deepEqual(result.value.lines.map((line) => line.id), ["line-2"]);
  assert.equal(orderTotalCents(result.value), 300);
});

test("removeLine refuses to remove the last line", () => {
  assert.deepEqual(removeLine(makeOrder(), "line-1", deps), {
    ok: false,
    errors: { lines: "An order needs at least one line" },
  });
});

test("removeLine is blocked on Confirmed and Cancelled orders", () => {
  const order = makeOrder({
    status: "Confirmed",
    lines: [makeLine({ id: "line-1" }), makeLine({ id: "line-2" })],
  });
  assert.deepEqual(removeLine(order, "line-1", deps), { ok: false, errors: { status: DRAFT_ONLY } });
});

test("confirmOrder moves a Draft order to Confirmed", () => {
  const result = confirmOrder(makeOrder(), deps);
  assert.equal(result.value.status, "Confirmed");
  assert.equal(result.value.updatedAt, LATER);
});

test("confirmOrder refuses an order with no lines", () => {
  assert.deepEqual(confirmOrder(makeOrder({ lines: [] }), deps), {
    ok: false,
    errors: { lines: "An order needs at least one line" },
  });
});

test("confirmOrder is refused on Confirmed and Cancelled orders", () => {
  assert.deepEqual(confirmOrder(confirmedOrder(), deps), {
    ok: false,
    errors: { status: "An order cannot move from Confirmed to Confirmed" },
  });
  assert.deepEqual(confirmOrder(makeOrder({ status: "Cancelled" }), deps), {
    ok: false,
    errors: { status: "An order cannot move from Cancelled to Confirmed" },
  });
});

test("cancelOrder moves a Confirmed order to Cancelled", () => {
  const result = cancelOrder(confirmedOrder(), deps);
  assert.equal(result.value.status, "Cancelled");
  assert.equal(result.value.updatedAt, LATER);
});

test("cancelOrder is refused on Draft and Cancelled orders", () => {
  assert.deepEqual(cancelOrder(makeOrder(), deps), {
    ok: false,
    errors: { status: "An order cannot move from Draft to Cancelled" },
  });
  assert.deepEqual(cancelOrder(makeOrder({ status: "Cancelled" }), deps), {
    ok: false,
    errors: { status: "An order cannot move from Cancelled to Cancelled" },
  });
});

test("Cancelled is a final state: no transition leaves it", () => {
  const cancelled = makeOrder({ status: "Cancelled" });
  assert.equal(confirmOrder(cancelled, deps).ok, false);
  assert.equal(cancelOrder(cancelled, deps).ok, false);
  assert.equal(canDeleteOrder(cancelled).ok, false);
});

test("canDeleteOrder allows only Draft orders", () => {
  assert.deepEqual(canDeleteOrder(makeOrder({ id: "order-1" })), { ok: true, value: { id: "order-1" } });
  assert.deepEqual(canDeleteOrder(confirmedOrder()), {
    ok: false,
    errors: { status: "Only Draft orders can be deleted. Cancel a Confirmed order instead" },
  });
});

test("domain functions do not mutate frozen orders", () => {
  const order = Object.freeze(makeOrder({ lines: Object.freeze([makeLine({ id: "line-1" })]) }));
  addLine(order, { description: "Gadget", quantity: 1, unitPriceCents: 1 }, deps);
  updateLine(order, "line-1", { description: "Y", quantity: 2, unitPriceCents: 2 }, deps);
  confirmOrder(order, deps);
  assert.equal(order.lines.length, 1);
  assert.equal(order.status, "Draft");
  assert.equal(order.lines[0].description, "Widget");
});
