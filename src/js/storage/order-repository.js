import { canDeleteOrder, createOrder } from "../domain/order.js";
import { fail, ok } from "../domain/result.js";

const CUSTOMER_MISSING = { customerId: "Choose an existing customer" };

function customerExists(customers, customerId) {
  return customers.some((customer) => customer.id === customerId);
}

export function createOrderRepository({ store, newId, now } = {}) {
  return {
    list() {
      return store.read().orders;
    },

    get(id) {
      return store.read().orders.find((order) => order.id === id) ?? null;
    },

    listForCustomer(customerId) {
      return store.read().orders.filter((order) => order.customerId === customerId);
    },

    create(input) {
      return store.update(({ customers, orders }) => {
        const created = createOrder(input, { newId, now });
        if (!created.ok) {
          return created;
        }
        if (!customerExists(customers, created.value.customerId)) {
          return fail(CUSTOMER_MISSING);
        }
        return ok({ customers, orders: [...orders, created.value], result: created.value });
      });
    },

    // Replaces a stored order with a domain-updated copy. The order must already exist.
    replace(order) {
      return store.update(({ customers, orders }) => {
        const index = orders.findIndex((stored) => stored.id === order.id);
        if (index === -1) {
          return fail({ id: "Order not found" });
        }
        if (!customerExists(customers, order.customerId)) {
          return fail(CUSTOMER_MISSING);
        }
        const next = orders.map((stored, i) => (i === index ? order : stored));
        return ok({ customers, orders: next, result: order });
      });
    },

    // Only Draft orders can be removed. Confirmed and Cancelled orders are kept for history.
    remove(id) {
      return store.update(({ customers, orders }) => {
        const order = orders.find((stored) => stored.id === id);
        if (!order) {
          return fail({ id: "Order not found" });
        }
        const deletable = canDeleteOrder(order);
        if (!deletable.ok) {
          return deletable;
        }
        return ok({ customers, orders: orders.filter((stored) => stored.id !== id), result: { id } });
      });
    },
  };
}
