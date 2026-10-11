import { el } from "../../utils/dom.js";

export function emptyState({ message, action = null }) {
  return el("div", { class: "empty-state" }, el("p", {}, message), action);
}
