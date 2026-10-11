import { el } from "../../utils/dom.js";

// Wide tables scroll inside their own wrapper so the page never scrolls sideways.
// The wrapper is focusable for keyboard scrolling, so it is named (a focusable scroll region needs a name).
export function dataTable({ caption, headers, rows }) {
  return el(
    "div",
    { class: "table-wrap", tabindex: "0", role: "region", "aria-label": caption },
    el(
      "table",
      {},
      el("caption", {}, caption),
      el("thead", {}, el("tr", {}, headers.map((header) => el("th", {}, header)))),
      el("tbody", {}, rows.map((cells) => el("tr", {}, cells.map((cell) => el("td", {}, cell))))),
    ),
  );
}
