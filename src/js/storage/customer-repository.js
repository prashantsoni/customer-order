import { createCustomer, customerDeletionImpact, updateCustomer } from "../domain/customer.js";
import { fail, ok } from "../domain/result.js";

export function createCustomerRepository({ store, newId, now } = {}) {
  return {
    list() {
      return store.read().customers;
    },

    get(id) {
      return store.read().customers.find((customer) => customer.id === id) ?? null;
    },

    deletionImpact(id) {
      return customerDeletionImpact(id, store.read().orders);
    },

    // Creates when id is null, otherwise updates the customer with that id.
    save(input, { id = null } = {}) {
      return store.update(({ customers, orders }) => {
        if (id === null) {
          const created = createCustomer(input, { customers, newId, now });
          if (!created.ok) {
            return created;
          }
          return ok({ customers: [...customers, created.value], orders, result: created.value });
        }
        const index = customers.findIndex((customer) => customer.id === id);
        if (index === -1) {
          return fail({ id: "Customer not found" });
        }
        const updated = updateCustomer(customers[index], input, { customers, now });
        if (!updated.ok) {
          return updated;
        }
        const next = customers.map((customer, i) => (i === index ? updated.value : customer));
        return ok({ customers: next, orders, result: updated.value });
      });
    },

    // Deletes the customer and every order that belongs to them in one write.
    remove(id) {
      return store.update(({ customers, orders }) => {
        if (!customers.some((customer) => customer.id === id)) {
          return fail({ id: "Customer not found" });
        }
        const { orderIds } = customerDeletionImpact(id, orders).value;
        const removed = new Set(orderIds);
        return ok({
          customers: customers.filter((customer) => customer.id !== id),
          orders: orders.filter((order) => !removed.has(order.id)),
          result: { removedOrderCount: removed.size },
        });
      });
    },
  };
}
