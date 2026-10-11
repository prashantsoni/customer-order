import { parseRoute } from "../utils/route.js";
import { el } from "../utils/dom.js";
import { BLOCKED_MESSAGE } from "../storage/schema.js";
import { banner } from "./components/banner.js";
import { customersView } from "./views/customers.js";
import { customerDetailView } from "./views/customer-detail.js";
import { ordersView } from "./views/orders.js";
import { orderFormView } from "./views/order-form.js";
import { orderDetailView } from "./views/order-detail.js";

const NAV_LINKS = [
  { section: "customers", href: "#/customers", label: "Customers" },
  { section: "orders", href: "#/orders", label: "Orders" },
];

function sectionFor(route) {
  return route.name.startsWith("order") ? "orders" : "customers";
}

function appNav(section) {
  return el(
    "nav",
    { class: "app-nav", "aria-label": "Main" },
    NAV_LINKS.map((link) =>
      el("a", { href: link.href, "aria-current": link.section === section ? "page" : null }, link.label),
    ),
  );
}

function viewFor(ctx, route) {
  switch (route.name) {
    case "customer":
      return customerDetailView(ctx, route.id);
    case "orders":
      return ordersView(ctx);
    case "order-new":
      return orderFormView(ctx);
    case "order":
      return orderDetailView(ctx, route.id);
    default:
      return customersView(ctx);
  }
}

// Renders the current hash route into root. Views are rebuilt from storage on every render.
export function mountApp({ root, customers, orders, store }) {
  let flash = null;

  function render(moveFocus) {
    const route = parseRoute(window.location.hash);
    const view = viewFor(ctx, route);

    const notices = [];
    if (flash) {
      notices.push(banner({ role: "status", message: flash }));
      flash = null;
    }
    if (store.status().locked) {
      notices.push(banner({ role: "alert", message: BLOCKED_MESSAGE }));
    }

    root.replaceChildren(appNav(sectionFor(route)), ...notices, view);
    if (moveFocus) view.querySelector("h2")?.focus();
  }

  const ctx = {
    customers,
    orders,
    store,
    navigate(hash, message = null) {
      flash = message;
      if (window.location.hash === hash) {
        render(true);
        return;
      }
      window.location.hash = hash;
    },
    refresh(message = null) {
      flash = message;
      render(true);
    },
  };

  window.addEventListener("hashchange", () => render(true));
  render(false);
}
