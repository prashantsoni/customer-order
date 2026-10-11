import { el } from "../../utils/dom.js";
import { parseLineText } from "../../domain/order-line.js";
import { banner } from "../components/banner.js";
import { emptyState } from "../components/empty-state.js";
import { lineFields } from "../components/line-fields.js";

const CUSTOMER_REQUIRED = "Choose a customer";
const LINE_KEY = /^lines\.\d+\.(\w+)$/;

function showAlert(slot, messages) {
  slot.replaceChildren(...(messages.length > 0 ? [banner({ role: "alert", message: messages.join(" ") })] : []));
}

// Splits domain keys such as lines.0.quantity into line field errors; everything else is a general message.
function splitErrors(errors) {
  const lineErrors = {};
  const otherMessages = [];
  for (const [key, message] of Object.entries(errors)) {
    const match = LINE_KEY.exec(key);
    if (match) {
      lineErrors[match[1]] = message;
    } else {
      otherMessages.push(message);
    }
  }
  return { lineErrors, otherMessages };
}

// New order form: pick a customer and enter the first line. The order is saved as Draft.
export function orderFormView(ctx) {
  const heading = el("h2", { tabindex: "-1" }, "New order");

  const customers = ctx.customers.list();
  if (customers.length === 0) {
    return el(
      "section",
      { class: "view" },
      heading,
      emptyState({
        message: "Add a customer before creating an order.",
        action: el("a", { href: "#/customers", class: "button-primary" }, "Go to customers"),
      }),
    );
  }

  const notice = el("div", { class: "notices" });
  const customerError = el("p", { id: "order-customer-error", class: "field-error" });
  const sorted = [...customers].sort((a, b) => a.name.localeCompare(b.name));
  const customerSelect = el(
    "select",
    {
      id: "order-customer",
      name: "order-customer",
      "aria-describedby": "order-customer-error",
      on: {
        change: () => {
          customerError.textContent = "";
          customerSelect.removeAttribute("aria-invalid");
        },
      },
    },
    el("option", { value: "" }, "Choose a customer"),
    sorted.map((customer) => el("option", { value: customer.id }, customer.name)),
  );

  const line = lineFields();

  function showCustomerError(message) {
    customerError.textContent = message ?? "";
    if (message) {
      customerSelect.setAttribute("aria-invalid", "true");
    } else {
      customerSelect.removeAttribute("aria-invalid");
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    notice.replaceChildren();

    const customerId = customerSelect.value;
    const parsed = parseLineText(line.values());
    showCustomerError(customerId === "" ? CUSTOMER_REQUIRED : "");
    if (!parsed.ok) {
      showAlert(notice, line.setErrors(parsed.errors));
      return;
    }
    line.clearErrors();
    if (customerId === "") return;

    const result = ctx.orders.create({ customerId, lines: [parsed.value] });
    if (!result.ok) {
      const { customerId: customerMessage, ...rest } = result.errors;
      showCustomerError(customerMessage ?? "");
      const { lineErrors, otherMessages } = splitErrors(rest);
      showAlert(notice, [...line.setErrors(lineErrors), ...otherMessages]);
      return;
    }
    ctx.navigate(`#/orders/${encodeURIComponent(result.value.id)}`, "Order created as Draft.");
  }

  return el(
    "section",
    { class: "view" },
    el("p", {}, el("a", { href: "#/orders" }, "Back to orders")),
    heading,
    el(
      "form",
      { class: "order-form", on: { submit: handleSubmit } },
      notice,
      el(
        "div",
        { class: "field" },
        el("label", { for: "order-customer" }, "Customer"),
        customerSelect,
        customerError,
      ),
      el("h3", {}, "First line"),
      line.nodes,
      el("div", { class: "actions" }, el("button", { type: "submit", class: "button-primary" }, "Create order")),
    ),
  );
}
