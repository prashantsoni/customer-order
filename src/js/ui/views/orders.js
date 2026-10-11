import { el } from "../../utils/dom.js";
import { formatCents } from "../../utils/money.js";
import { formatTimestamp } from "../../utils/date.js";
import { orderTotalCents } from "../../domain/order.js";
import { ALL_STATUSES, ORDER_STATUS_FILTERS, filterOrders } from "../../domain/search.js";
import { emptyState } from "../components/empty-state.js";
import { dataTable } from "../components/table.js";

const UNKNOWN_CUSTOMER = "Unknown customer";

function orderRow(order, customerNames) {
  return [
    el("a", { href: `#/orders/${encodeURIComponent(order.id)}` }, customerNames.get(order.customerId) ?? UNKNOWN_CUSTOMER),
    order.status,
    formatCents(orderTotalCents(order)),
    formatTimestamp(order.createdAt),
  ];
}

export function ordersView(ctx) {
  const orders = ctx.orders.list();
  const customers = ctx.customers.list();
  const customerNames = new Map(customers.map((customer) => [customer.id, customer.name]));
  const heading = el("h2", { tabindex: "-1" }, "Orders");

  let status = ALL_STATUSES;
  let query = "";
  const results = el("div", { class: "results", "aria-live": "polite" });

  function renderResults() {
    if (orders.length === 0) {
      const newOrder = el("a", { href: "#/orders/new", class: "button-primary" }, "Create your first order");
      results.replaceChildren(emptyState({ message: "No orders yet.", action: newOrder }));
      return;
    }

    const matches = filterOrders(orders, customers, { status, query });
    if (matches.length === 0) {
      results.replaceChildren(emptyState({ message: "No orders match your filters." }));
      return;
    }

    results.replaceChildren(
      dataTable({
        caption: "Order list",
        headers: ["Customer", "Status", "Total", "Created"],
        rows: matches.map((order) => orderRow(order, customerNames)),
      }),
    );
  }

  const statusSelect = el(
    "select",
    {
      id: "order-status-filter",
      name: "order-status-filter",
      on: {
        change: (event) => {
          status = event.target.value;
          renderResults();
        },
      },
    },
    ORDER_STATUS_FILTERS.map((option) => el("option", { value: option }, option)),
  );

  const search = el("input", {
    id: "order-search",
    type: "search",
    autocomplete: "off",
    placeholder: "Customer name",
    on: {
      input: (event) => {
        query = event.target.value;
        renderResults();
      },
    },
  });

  renderResults();

  return el(
    "section",
    { class: "view" },
    heading,
    el("p", {}, el("a", { href: "#/orders/new", class: "button-primary" }, "New order")),
    el(
      "div",
      { class: "filters" },
      el("div", { class: "field" }, el("label", { for: "order-status-filter" }, "Status"), statusSelect),
      el("div", { class: "field" }, el("label", { for: "order-search" }, "Search by customer"), search),
    ),
    results,
  );
}
