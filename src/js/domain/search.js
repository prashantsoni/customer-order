import { ORDER_STATUSES } from "./order.js";

export const ALL_STATUSES = "All";
export const ORDER_STATUS_FILTERS = Object.freeze([ALL_STATUSES, ...ORDER_STATUSES]);

function normalize(query) {
  return typeof query === "string" ? query.trim().toLowerCase() : "";
}

function contains(value, needle) {
  return typeof value === "string" && value.toLowerCase().includes(needle);
}

// Case-insensitive, matches part of name or email. An empty query returns every customer.
export function searchCustomers(customers, query) {
  const needle = normalize(query);
  if (needle === "") {
    return [...customers];
  }
  return customers.filter((customer) => contains(customer.name, needle) || contains(customer.email, needle));
}

// Status and customer-name search combine: each result matches every active criterion.
export function filterOrders(orders, customers, { status = ALL_STATUSES, query = "" } = {}) {
  if (status !== ALL_STATUSES && !ORDER_STATUSES.includes(status)) {
    return [];
  }
  const needle = normalize(query);
  const namesById = new Map(customers.map((customer) => [customer.id, customer.name]));
  return orders.filter(
    (order) =>
      (status === ALL_STATUSES || order.status === status) &&
      (needle === "" || contains(namesById.get(order.customerId), needle)),
  );
}
