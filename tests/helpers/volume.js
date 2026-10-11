import { SCHEMA_VERSION } from "../../src/js/storage/schema.js";

// Test-only seed for the design volume in NFR-01: 500 customers and 5,000 orders.
const VOLUME_CUSTOMERS = 500;
const VOLUME_ORDERS = 5000;

const FIRST_NAMES = ["Ada", "Grace", "Alan", "Edsger", "Barbara", "Donald", "Margaret", "Linus"];
const LAST_NAMES = ["Lovelace", "Hopper", "Turing", "Dijkstra", "Liskov", "Knuth", "Hamilton", "Torvalds"];
const STATUSES = ["Draft", "Confirmed", "Cancelled"];
const STAMP = "2026-10-11T09:00:00.000Z";

// Returns a saved-state document with the given counts. Each order has 1 to 3 lines.
// Orders are spread across customers and statuses so search results vary.
export function makeVolumeDocument({ customers = VOLUME_CUSTOMERS, orders = VOLUME_ORDERS } = {}) {
  const customerList = Array.from({ length: customers }, (_, i) => ({
    id: `cust-${i}`,
    name: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length]} ${i}`,
    email: `user${i}@example.com`,
    phone: i % 2 === 0 ? `+44 20 7946 ${String(i).padStart(4, "0")}` : null,
    createdAt: STAMP,
    updatedAt: STAMP,
  }));

  const orderList = Array.from({ length: orders }, (_, i) => ({
    id: `order-${i}`,
    customerId: `cust-${i % customers}`,
    status: STATUSES[i % STATUSES.length],
    createdAt: STAMP,
    updatedAt: STAMP,
    lines: Array.from({ length: 1 + (i % 3) }, (_, j) => ({
      id: `line-${i}-${j}`,
      description: `Item ${j + 1} for order ${i}`,
      quantity: 1 + ((i + j) % 9),
      unitPriceCents: 100 + ((i * 37 + j * 11) % 9900),
    })),
  }));

  return { schemaVersion: SCHEMA_VERSION, customers: customerList, orders: orderList };
}
