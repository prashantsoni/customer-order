import { el } from "../../utils/dom.js";
import { searchCustomers } from "../../domain/search.js";
import { banner } from "../components/banner.js";
import { customerForm } from "../components/customer-form.js";
import { emptyState } from "../components/empty-state.js";
import { dataTable } from "../components/table.js";

const NOT_GIVEN = "Not given";

function customerRow(customer) {
  return [
    el("a", { href: `#/customers/${encodeURIComponent(customer.id)}` }, customer.name),
    customer.email ?? NOT_GIVEN,
    customer.phone ?? NOT_GIVEN,
  ];
}

export function customersView(ctx) {
  const customers = ctx.customers.list();
  const heading = el("h2", { tabindex: "-1" }, "Customers");
  const notices = el("div", { class: "notices" });

  if (ctx.store.status().recovered) {
    const recovered = banner({
      role: "status",
      message:
        "Saved customer data could not be read. It was copied to a backup and the list was reset.",
      onDismiss: () => {
        ctx.store.dismissRecovery();
        recovered.remove();
        heading.focus();
      },
    });
    notices.append(recovered);
  }

  let query = "";
  const results = el("div", { class: "results", "aria-live": "polite" });

  const addForm = customerForm({
    submitLabel: "Add customer",
    onSubmit: (values) => ctx.customers.save(values),
    onSaved: () => ctx.refresh("Customer added."),
  });

  function renderResults() {
    if (customers.length === 0) {
      const addFirst = el(
        "button",
        {
          type: "button",
          class: "button-primary",
          on: { click: () => addForm.nameInput.focus() },
        },
        "Add your first customer",
      );
      results.replaceChildren(emptyState({ message: "No customers yet.", action: addFirst }));
      return;
    }

    const matches = searchCustomers(customers, query);
    if (matches.length === 0) {
      results.replaceChildren(emptyState({ message: "No customers match your search." }));
      return;
    }

    results.replaceChildren(
      dataTable({
        caption: "Customer list",
        headers: ["Name", "Email", "Phone"],
        rows: matches.map(customerRow),
      }),
    );
  }

  const search = el("input", {
    id: "customer-search",
    type: "search",
    autocomplete: "off",
    placeholder: "Name or email",
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
    notices,
    el("div", { class: "field" }, el("label", { for: "customer-search" }, "Search customers"), search),
    results,
    el("section", { class: "add-customer" }, el("h3", {}, "Add a customer"), addForm.element),
  );
}
