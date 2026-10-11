---
title: Build choices for the P3 app shell and customer UI
description: Native dialog, hash routing, add form on the list page, inline validation without native constraints, and form-level save errors.
ms.date: 2026-10-12
ms.topic: concept
keywords:
  - decision
  - ui
  - routing
  - accessibility
---

## Status

Accepted, with inferred rationale. Builder to confirm.

## Context

Phase P3 builds the first user interface: the app shell, the customer list, the customer detail page and the banners for recovered data and failed saves. The documents fix the behaviour (PRD FR-01 to FR-05, FR-14 to FR-16, FR-17) but not the build choices ([PRD FR-17](../requirements/refined/customer-order-prd.md), [BRD BR-017](../brds/customer-order-brd.md)).

## Options Considered

| Topic | Chosen | Alternative | Trade-offs |
|-------|--------|-------------|------------|
| Confirmation dialog | Native `<dialog>` with `showModal()` | Custom `div` with a manual focus trap | The browser provides the focus trap, Escape to close and focus return. Less code to test. |
| Routing | Hash routes (`#/customers`, `#/customers/:id`) | History API routes | Works from a static server with no rewrite rules. Orders routes are added in P4. |
| Add customer | Form on the list page | Separate "new customer" page | One fewer route and one fewer view. The empty state links to the same form. |
| Validation | Inline errors from domain validators, no native `required`, `type="email"` or `maxlength` | Native constraint validation | Native constraints block submit before the app can show its own messages and values. The domain stays the single source of rules. |
| Save failure | Form-level `role="alert"` banner; entered values kept | Toast or transient message | Matches [D-18](2026-10-11-save-failure-handling.md). The user can retry without retyping. |
| Recovered data | `role="status"` banner on the customer list, dismissible, dismissal stored with `store.dismissRecovery()` | Banner on every route | The banner is shown once where the user starts. Dismissal survives reload. |
| Dialog name | `aria-label` on the dialog | `aria-labelledby` | The label text is the same. `aria-labelledby` and `scope` were added to the `el()` allow-list in `src/js/utils/dom.js` later, so dialogs can switch if needed. Dialogs keep `aria-label` for now. |
| Orders on detail page | Placeholder text until P4 | Hide the section | Keeps FR-11 visible as pending. P4 replaces the text with the order list. |
| Dates | Locale formatting with `toLocaleString` at render time | Fixed format | Matches [D-27](2026-10-11-english-only-locale.md) and [D-30](2026-10-11-iso-8601-dates.md) (stored as ISO 8601). |

## Decision

Use a native `<dialog>` for confirmation, hash routing, an add form on the customer list page, inline validation without native constraints, form-level alerts for save failures, and a recovered-data banner on the customer list only. Use `aria-label` on the dialog. Show placeholder text in the customer detail orders section until P4.

## Reason

These choices keep the UI small, keep the rules in the domain layer, and meet the accessibility and error-state requirements with the fewest moving parts ([D-21](2026-10-11-vanilla-js-no-build-step.md), [D-26](2026-10-11-accessibility-wcag-22-aa.md), [D-24](2026-10-11-text-rendering-textcontent.md)).

## Consequences

* Inline errors use `aria-invalid` and `aria-describedby`. Every form has a visible error state.
* A failed save keeps the entered values ([PRD FR-15](../requirements/refined/customer-order-prd.md)).
* The customer detail page shows a placeholder for orders until P4 ([PRD FR-11](../requirements/refined/customer-order-prd.md)).
* The delete confirmation counts orders through the domain. The order-count branch is exercised in P4 when orders exist in the UI.

## Assumptions and Risks

* Inferred: the closest rationale in the workspace documents is used for the build choices above. The builder confirms or changes them.
* Risk: the placeholder orders text must be replaced in P4. The review note tracks it.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the P3 implementation and the workspace documents. Builder review pending.
