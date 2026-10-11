import { el } from "../../utils/dom.js";

export function notFoundView({ noun = "Customer", listHref = "#/customers", listLabel = "Back to customers" } = {}) {
  return el(
    "section",
    { class: "view" },
    el("h2", { tabindex: "-1" }, `${noun} not found`),
    el("p", {}, `This ${noun.toLowerCase()} does not exist, or the link is out of date.`),
    el("p", {}, el("a", { href: listHref }, listLabel)),
  );
}
