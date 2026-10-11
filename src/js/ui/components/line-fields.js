import { CURRENCY } from "../../utils/config.js";
import { centsToPriceText } from "../../utils/money.js";
import { field } from "./field.js";

// Shared line inputs for the new-order form and the order line form.
// Errors use the domain keys (description, quantity, unitPriceCents); unmapped messages are returned to the caller.
const KEY_TO_FIELD = Object.freeze({ description: "description", quantity: "quantity", unitPriceCents: "unitPrice" });

export function lineFields({ line = null } = {}) {
  const fields = {
    description: field({
      id: "line-description",
      label: "Description",
      value: line?.description ?? "",
      autocomplete: "off",
    }),
    quantity: field({
      id: "line-quantity",
      label: "Quantity",
      value: line ? String(line.quantity) : "1",
      inputmode: "numeric",
      autocomplete: "off",
    }),
    unitPrice: field({
      id: "line-unit-price",
      label: `Unit price (${CURRENCY})`,
      value: line ? centsToPriceText(line.unitPriceCents) : "",
      inputmode: "decimal",
      autocomplete: "off",
    }),
  };

  function clearErrors() {
    for (const item of Object.values(fields)) {
      item.setError("");
    }
  }

  // Shows each error next to its field. Returns the messages that have no field here.
  function setErrors(errors) {
    clearErrors();
    const unmapped = [];
    for (const [key, message] of Object.entries(errors)) {
      const target = KEY_TO_FIELD[key];
      if (target) {
        fields[target].setError(message);
      } else {
        unmapped.push(message);
      }
    }
    return unmapped;
  }

  function values() {
    return {
      description: fields.description.input.value,
      quantity: fields.quantity.input.value,
      unitPrice: fields.unitPrice.input.value,
    };
  }

  return {
    nodes: [fields.description.root, fields.quantity.root, fields.unitPrice.root],
    firstInput: fields.description.input,
    values,
    setErrors,
    clearErrors,
  };
}
