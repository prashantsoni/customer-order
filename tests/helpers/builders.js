export const CREATED_AT = "2026-10-11T09:00:00.000Z";

export function makeLine(overrides = {}) {
  return { id: "line-1", description: "Widget", quantity: 1, unitPriceCents: 100, ...overrides };
}

export function makeCustomer(overrides = {}) {
  return {
    id: "cust-1",
    name: "Ada Lovelace",
    email: "ada@example.com",
    phone: null,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    ...overrides,
  };
}

export function makeOrder(overrides = {}) {
  return {
    id: "order-1",
    customerId: "cust-1",
    status: "Draft",
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    lines: [makeLine()],
    ...overrides,
  };
}
