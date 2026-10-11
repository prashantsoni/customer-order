import { el } from "../../utils/dom.js";
import { formatCents } from "../../utils/money.js";
import { formatTimestamp } from "../../utils/date.js";
import { orderTotalCents } from "../../domain/order.js";
import { banner } from "../components/banner.js";
import { confirmDialog } from "../components/confirm-dialog.js";
import { customerForm } from "../components/customer-form.js";
import { emptyState } from "../components/empty-state.js";
import { dataTable } from "../components/table.js";
import { notFoundView } from "./not-found.js";

const NOT_GIVEN = "Not given";

function customerOrderRow(order) {
  return [
    el("a", { href: `#/orders/${encodeURIComponent(order.id)}` }, formatTimestamp(order.createdAt)),
    order.status,
    formatCents(orderTotalCents(order)),
  ];
}

function customerOrdersSection(ctx, customerId) {
  const orders = ctx.orders.listForCustomer(customerId);
  const content =
    orders.length === 0
      ? emptyState({ message: "This customer has no orders yet." })
      : dataTable({
          caption: "Customer orders",
          headers: ["Created", "Status", "Total"],
          rows: orders.map(customerOrderRow),
        });
  return el("section", {}, el("h3", {}, "Orders"), content);
}

function firstError(errors) {
  return Object.values(errors)[0] ?? "The customer could not be deleted.";
}

function deleteMessage(ctx, id, name) {
  const count = ctx.customers.deletionImpact(id).value.orderIds.length;
  const impact =
    count === 0
      ? "This customer has no orders."
      : `This also removes ${count} ${count === 1 ? "order" : "orders"}.`;
  return `Delete ${name}? ${impact} This cannot be undone.`;
}

export function customerDetailView(ctx, id) {
  const customer = ctx.customers.get(id);
  if (!customer) return notFoundView();

  const heading = el("h2", { tabindex: "-1" }, "Customer details");
  const notice = el("div", { class: "notices" });

  const dialog = confirmDialog({
    title: "Delete customer",
    confirmLabel: "Delete customer",
    onConfirm: () => {
      const result = ctx.customers.remove(id);
      if (result.ok) {
        ctx.navigate("#/customers");
        return;
      }
      notice.replaceChildren(banner({ role: "alert", message: firstError(result.errors) }));
    },
  });

  const editForm = customerForm({
    customer,
    submitLabel: "Save changes",
    onSubmit: (values) => ctx.customers.save(values, { id }),
    onSaved: () => ctx.refresh("Changes saved."),
  });

  const deleteButton = el(
    "button",
    {
      type: "button",
      class: "button-danger",
      on: { click: (event) => dialog.open(deleteMessage(ctx, id, customer.name), event.currentTarget) },
    },
    "Delete customer",
  );

  return el(
    "section",
    { class: "view" },
    el("p", {}, el("a", { href: "#/customers" }, "Back to customers")),
    heading,
    notice,
    el(
      "dl",
      { class: "details" },
      el("dt", {}, "Name"),
      el("dd", {}, customer.name),
      el("dt", {}, "Email"),
      el("dd", {}, customer.email ?? NOT_GIVEN),
      el("dt", {}, "Phone"),
      el("dd", {}, customer.phone ?? NOT_GIVEN),
      el("dt", {}, "Last updated"),
      el("dd", {}, formatTimestamp(customer.updatedAt)),
    ),
    el("section", {}, el("h3", {}, "Edit customer"), editForm.element),
    customerOrdersSection(ctx, id),
    el(
      "section",
      { class: "danger-zone" },
      el("h3", {}, "Delete customer"),
      deleteButton,
      dialog.element,
    ),
  );
}
