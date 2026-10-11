import { createCustomerRepository } from "./customer-repository.js";
import { createOrderRepository } from "./order-repository.js";
import { createStore } from "./store.js";

// Composition root for storage. Only this module and main.js may reference localStorage.
export function createAppStorage({ storage = globalThis.localStorage, now, newId, ...options } = {}) {
  const store = createStore({ storage, now, ...options });
  return {
    store,
    customers: createCustomerRepository({ store, newId, now }),
    orders: createOrderRepository({ store, newId, now }),
  };
}
