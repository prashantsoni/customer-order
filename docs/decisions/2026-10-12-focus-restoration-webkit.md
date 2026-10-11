---
title: Explicit focus return for dialogs and the line form (WebKit)
description: Dialogs and the line form return focus to the element that opened them, passed in explicitly, so WebKit and other engines behave the same.
ms.date: 2026-10-12
ms.topic: concept
keywords:
  - decision
  - accessibility
  - focus
  - webkit
  - dialog
---

## Status

Accepted, with inferred rationale. Builder to confirm.

## Context

After the P5 dialog work, the `desktop-webkit` project failed three focus checks: Escape closes the confirm dialog (`tests/e2e/accessibility.spec.js`), Cancel on the line form (`tests/e2e/accessibility.spec.js`), and delete customer (`tests/e2e/customers.spec.js`). WebKit does not focus a button on mouse click, so the element active when the dialog opened was `body`. Native `<dialog>` focus restoration did not return focus to the opener in WebKit. The PRD requires keyboard access ([PRD FR-17 and NFR-04](../requirements/refined/customer-order-prd.md)). The focus-return rule is part of the [P5 record](2026-10-12-p5-responsive-a11y.md) (D-34) and the [accessibility decision](2026-10-11-accessibility-wcag-22-aa.md).

## Options Considered

| Option                                 | Summary                                                                                                  | Trade-offs                                                                 |
|----------------------------------------|----------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------|
| Rely on native dialog focus restore    | Keep the browser default and read `document.activeElement` at open time.                                 | Fails in WebKit, where the active element is `body`. Keyboard users lose their place. |
| Pass the opener explicitly (chosen)    | Callers pass the element that opened the dialog or form. The close handler focuses it if it is still connected. | One extra argument at each call site. Same behaviour in all four Playwright projects. |
| Skip focus assertions for WebKit       | Mark the three tests as known failures for WebKit.                                                       | Hides a real focus defect. Rejected. (Inferred option.)                    |

## Decision

Pass the element that opened a confirm dialog or the line form as an explicit opener. On close, focus the opener if it is still in the document, then clear it. The change is in [confirm-dialog.js](../../src/js/ui/components/confirm-dialog.js), [customer-detail.js](../../src/js/ui/views/customer-detail.js), and [order-detail.js](../../src/js/ui/views/order-detail.js).

## Reason

An explicit opener does not depend on which element the browser focuses on click, so every engine restores focus the same way. (Inferred reason: the builder accepted the fix after the WebKit failures.)

## Consequences

* `confirmDialog().open(message, openerElement)` accepts the opener. Omitting it leaves focus to the browser default.
* The line form takes the opener in `openLineForm(line, opener)`. Cancel returns focus to it.
* The opener is cleared on close, so a stale element is not reused.
* The three WebKit tests pass in the runs recorded in [phase-6-review.md](../reviews/phase-6-review.md).

## Assumptions and Risks

* Inferred: the three failures come from WebKit's click focus behaviour, not from timing. Not confirmed at engine level.
* Risk: one background WebKit run after the fix reported the same three failures. Later reruns did not reproduce them. The cause is not known; see the deferred items in [phase-6-review.md](../reviews/phase-6-review.md).
* Risk: if the opener has been removed from the document, focus is not restored and falls to the browser default.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: diagnosed the WebKit failures from the Playwright output and drafted the change. Builder review pending.
