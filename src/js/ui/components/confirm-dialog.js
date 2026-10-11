import { el } from "../../utils/dom.js";

const FOCUSABLE = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

let dialogCount = 0;

// Chromium does not wrap Tab inside a modal dialog; trapTab wraps it.
// Cancel comes first in the DOM so it receives initial focus for destructive actions.
export function confirmDialog({ title, confirmLabel, onConfirm }) {
  dialogCount += 1;
  // Unique per dialog: order detail renders several dialogs on one page.
  const messageId = `confirm-message-${dialogCount}`;
  const messageEl = el("p", { id: messageId });

  function trapTab(event) {
    if (event.key !== "Tab") return;
    const items = dialog.querySelectorAll(FOCUSABLE);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const dialog = el(
    "dialog",
    {
      class: "confirm-dialog",
      "aria-label": title,
      "aria-describedby": messageId,
      on: { keydown: trapTab },
    },
    messageEl,
    el(
      "div",
      { class: "actions" },
      el("button", { type: "button", class: "button-secondary", on: { click: () => dialog.close() } }, "Cancel"),
      el(
        "button",
        {
          type: "button",
          class: "button-danger",
          on: {
            click: () => {
              dialog.close();
              onConfirm();
            },
          },
        },
        confirmLabel,
      ),
    ),
  );

  // WebKit does not focus a button on click, so the opener is passed in by the caller.
  let opener = null;

  // Focus returns to the opener on every close; if it was removed by a re-render, focus stays put.
  dialog.addEventListener("close", () => {
    if (opener?.isConnected) opener.focus();
    opener = null;
  });

  function open(message, openerElement) {
    messageEl.textContent = message;
    opener = openerElement ?? null;
    dialog.showModal();
  }

  return { element: dialog, open };
}
