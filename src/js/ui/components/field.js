import { el } from "../../utils/dom.js";

// Labelled input with an inline error slot linked through aria-describedby.
export function field({ id, label, value = "", type = "text", inputmode, autocomplete, placeholder }) {
  const errorId = `${id}-error`;
  const input = el("input", {
    id,
    name: id,
    type,
    value,
    inputmode,
    autocomplete,
    placeholder,
    "aria-describedby": errorId,
  });
  const error = el("p", { id: errorId, class: "field-error" });

  function setError(message) {
    error.textContent = message ?? "";
    if (message) {
      input.setAttribute("aria-invalid", "true");
    } else {
      input.removeAttribute("aria-invalid");
    }
  }

  const root = el("div", { class: "field" }, el("label", { for: id }, label), input, error);
  return { root, input, setError };
}
