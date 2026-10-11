import { el } from "../../utils/dom.js";
import { field } from "./field.js";
import { banner } from "./banner.js";

const FIELD_SPECS = [
  { key: "name", label: "Name", autocomplete: "off" },
  { key: "email", label: "Email (optional)", inputmode: "email", autocomplete: "off" },
  { key: "phone", label: "Phone (optional)", inputmode: "tel", autocomplete: "off" },
];

// Customer create and edit form. Field errors show inline; other errors show in a form-level alert.
// Entered values are kept on failure because the form is not re-rendered.
export function customerForm({ customer = null, submitLabel, onSubmit, onSaved }) {
  const fields = {};
  for (const spec of FIELD_SPECS) {
    fields[spec.key] = field({
      id: `customer-${spec.key}`,
      label: spec.label,
      value: customer?.[spec.key] ?? "",
      inputmode: spec.inputmode,
      autocomplete: spec.autocomplete,
    });
  }

  const alertSlot = el("div", { class: "form-alert" });

  function clearErrors() {
    for (const item of Object.values(fields)) item.setError("");
    alertSlot.replaceChildren();
  }

  function showErrors(errors) {
    clearErrors();
    const general = [];
    for (const [key, message] of Object.entries(errors)) {
      if (fields[key]) {
        fields[key].setError(message);
      } else {
        general.push(message);
      }
    }
    if (general.length > 0) {
      alertSlot.replaceChildren(banner({ role: "alert", message: general.join(" ") }));
    }
  }

  function readValues() {
    return {
      name: fields.name.input.value,
      email: fields.email.input.value,
      phone: fields.phone.input.value,
    };
  }

  const form = el(
    "form",
    {
      class: "customer-form",
      on: {
        submit: (event) => {
          event.preventDefault();
          clearErrors();
          const result = onSubmit(readValues());
          if (result.ok) {
            onSaved(result.value);
          } else {
            showErrors(result.errors);
          }
        },
      },
    },
    alertSlot,
    fields.name.root,
    fields.email.root,
    fields.phone.root,
    el("div", { class: "actions" }, el("button", { type: "submit", class: "button-primary" }, submitLabel)),
  );

  return { element: form, nameInput: fields.name.input };
}
