import { el } from "../../utils/dom.js";

// Status banners use role "status" (polite, dismissible); alerts use role "alert" (assertive, persistent).
export function banner({ role, message, onDismiss = null }) {
  return el(
    "div",
    { class: `banner banner-${role}`, role },
    el("p", {}, message),
    onDismiss ? el("button", { type: "button", class: "button-secondary", on: { click: onDismiss } }, "Dismiss") : null,
  );
}
