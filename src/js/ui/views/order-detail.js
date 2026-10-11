import { el } from "../../utils/dom.js";
import { formatCents } from "../../utils/money.js";
import { formatTimestamp } from "../../utils/date.js";
import { parseLineText } from "../../domain/order-line.js";
import {
  ORDER_STATUS,
  addLine,
  cancelOrder,
  confirmOrder,
  orderTotalCents,
  removeLine,
  updateLine,
} from "../../domain/order.js";
import { banner } from "../components/banner.js";
import { confirmDialog } from "../components/confirm-dialog.js";
import { lineFields } from "../components/line-fields.js";
import { dataTable } from "../components/table.js";
import { notFoundView } from "./not-found.js";

const UNKNOWN_CUSTOMER = "Unknown customer";

function messagesFrom(errors) {
  return Object.values(errors).join(" ");
}

export function orderDetailView(ctx, id) {
  const order = ctx.orders.get(id);
  if (!order) {
    return notFoundView({ noun: "Order", listHref: "#/orders", listLabel: "Back to orders" });
  }

  const customer = ctx.customers.get(order.customerId);
  const isDraft = order.status === ORDER_STATUS.DRAFT;
  const isConfirmed = order.status === ORDER_STATUS.CONFIRMED;
  const heading = el("h2", { tabindex: "-1" }, "Order details");
  const notice = el("div", { class: "notices" });
  const lineFormSlot = el("div", { class: "line-form-slot" });

  function showError(message) {
    notice.replaceChildren(banner({ role: "alert", message }));
  }

  function saveOrder(next, message) {
    const saved = ctx.orders.replace(next);
    if (!saved.ok) {
      showError(messagesFrom(saved.errors));
      return;
    }
    ctx.refresh(message);
  }

  // Line removal confirmation. The pending line is set before the dialog opens.
  let pendingLineId = null;
  const removeLineDialog = confirmDialog({
    title: "Remove line",
    confirmLabel: "Remove line",
    onConfirm: () => {
      const result = removeLine(order, pendingLineId);
      if (!result.ok) {
        showError(messagesFrom(result.errors));
        return;
      }
      saveOrder(result.value, "Line removed.");
    },
  });

  const cancelOrderDialog = confirmDialog({
    title: "Cancel order",
    confirmLabel: "Cancel order",
    onConfirm: () => {
      const result = cancelOrder(order);
      if (!result.ok) {
        showError(messagesFrom(result.errors));
        return;
      }
      saveOrder(result.value, "Order cancelled.");
    },
  });

  const deleteOrderDialog = confirmDialog({
    title: "Delete order",
    confirmLabel: "Delete order",
    onConfirm: () => {
      const result = ctx.orders.remove(id);
      if (result.ok) {
        ctx.navigate("#/orders", "Order deleted.");
        return;
      }
      showError(messagesFrom(result.errors));
    },
  });

  const confirmOrderDialog = confirmDialog({
    title: "Confirm order",
    confirmLabel: "Confirm order",
    onConfirm: () => {
      const result = confirmOrder(order);
      if (!result.ok) {
        showError(messagesFrom(result.errors));
        return;
      }
      saveOrder(result.value, "Order confirmed.");
    },
  });

  function openLineForm(line, opener) {
    const fields = lineFields({ line });

    function submit(event) {
      event.preventDefault();
      notice.replaceChildren();

      const parsed = parseLineText(fields.values());
      if (!parsed.ok) {
        const unmapped = fields.setErrors(parsed.errors);
        if (unmapped.length > 0) showError(unmapped.join(" "));
        return;
      }
      fields.clearErrors();

      const result = line ? updateLine(order, line.id, parsed.value) : addLine(order, parsed.value);
      if (!result.ok) {
        const unmapped = fields.setErrors(result.errors);
        if (unmapped.length > 0) showError(unmapped.join(" "));
        return;
      }
      saveOrder(result.value, line ? "Line updated." : "Line added.");
    }

    const form = el(
      "form",
      { class: "line-form", on: { submit } },
      fields.nodes,
      el(
        "div",
        { class: "actions" },
        el("button", { type: "submit", class: "button-primary" }, line ? "Save line" : "Add line"),
        el(
          "button",
          {
            type: "button",
            class: "button-secondary",
            on: {
              click: () => {
                lineFormSlot.replaceChildren();
                opener?.focus();
              },
            },
          },
          "Cancel",
        ),
      ),
    );

    lineFormSlot.replaceChildren(el("h3", {}, line ? "Edit line" : "Add line"), form);
    fields.firstInput.focus();
  }

  const lineHeaders = isDraft
    ? ["Description", "Quantity", "Unit price", "Actions"]
    : ["Description", "Quantity", "Unit price"];

  const lineRows = order.lines.map((line) => {
    const cells = [line.description, String(line.quantity), formatCents(line.unitPriceCents)];
    if (isDraft) {
      const onlyLine = order.lines.length === 1;
      cells.push(
        el(
          "div",
          { class: "row-actions" },
          el(
            "button",
            { type: "button", class: "button-secondary", on: { click: (event) => openLineForm(line, event.currentTarget) } },
            `Edit ${line.description}`,
          ),
          el(
            "button",
            {
              type: "button",
              class: "button-danger",
              disabled: onlyLine,
              on: {
                click: (event) => {
                  pendingLineId = line.id;
                  removeLineDialog.open(`Remove ${line.description}? This cannot be undone.`, event.currentTarget);
                },
              },
            },
            `Remove ${line.description}`,
          ),
        ),
      );
    }
    return cells;
  });

  const actions = [];
  if (isDraft) {
    actions.push(
      el(
        "button",
        {
          type: "button",
          class: "button-primary",
          on: { click: (event) => confirmOrderDialog.open("Confirm this order? A confirmed order cannot return to Draft.", event.currentTarget) },
        },
        "Confirm order",
      ),
      el(
        "button",
        {
          type: "button",
          class: "button-danger",
          on: { click: (event) => deleteOrderDialog.open("Delete this draft order? This cannot be undone.", event.currentTarget) },
        },
        "Delete order",
      ),
    );
  }
  if (isConfirmed) {
    actions.push(
      el(
        "button",
        {
          type: "button",
          class: "button-danger",
          on: { click: (event) => cancelOrderDialog.open("Cancel this order? A cancelled order cannot be changed.", event.currentTarget) },
        },
        "Cancel order",
      ),
    );
  }

  const statusNote = isDraft
    ? "This order is a Draft. Add, edit or remove lines, then confirm it."
    : isConfirmed
      ? "This order is Confirmed. Its lines are read-only; you can cancel it."
      : "This order is Cancelled and cannot be changed.";

  return el(
    "section",
    { class: "view" },
    el("p", {}, el("a", { href: "#/orders" }, "Back to orders")),
    heading,
    notice,
    el(
      "dl",
      { class: "details" },
      el("dt", {}, "Customer"),
      el(
        "dd",
        {},
        customer
          ? el("a", { href: `#/customers/${encodeURIComponent(customer.id)}` }, customer.name)
          : UNKNOWN_CUSTOMER,
      ),
      el("dt", {}, "Status"),
      el("dd", {}, order.status),
      el("dt", {}, "Total"),
      el("dd", {}, formatCents(orderTotalCents(order))),
      el("dt", {}, "Created"),
      el("dd", {}, formatTimestamp(order.createdAt)),
      el("dt", {}, "Last updated"),
      el("dd", {}, formatTimestamp(order.updatedAt)),
    ),
    el("p", {}, statusNote),
    el(
      "section",
      {},
      el("h3", {}, "Lines"),
      dataTable({ caption: "Order lines", headers: lineHeaders, rows: lineRows }),
      isDraft
        ? el(
            "div",
            { class: "actions" },
            el(
              "button",
              { type: "button", class: "button-secondary", on: { click: (event) => openLineForm(null, event.currentTarget) } },
              "Add line",
            ),
          )
        : null,
      lineFormSlot,
    ),
    actions.length > 0 ? el("section", { class: "actions" }, ...actions) : null,
    removeLineDialog.element,
    confirmOrderDialog.element,
    cancelOrderDialog.element,
    deleteOrderDialog.element,
  );
}
