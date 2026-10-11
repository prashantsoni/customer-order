---
title: Decision Tracker
description: Tracks the decisions to record in docs/decisions/, their sources and recording status
ms.date: 2026-10-12
ms.topic: reference
keywords:
  - decision
  - tracker
---

## Status Key

* Recorded: a decision record exists in `docs/decisions/`.
* Recorded from inferred rationale: the BRD or PRD does not state the options, the reason, or both. The record uses the closest documented rationale and is marked for builder confirmation.

## Recorded

| ID   | Decision                                 | Source            | Record                                                                                                  |
|------|------------------------------------------|-------------------|---------------------------------------------------------------------------------------------------------|
| D-01 | Single user per browser, no login        | GAP-01, A-01      | [../decisions/2026-10-11-single-user-no-login.md](../decisions/2026-10-11-single-user-no-login.md)     |
| D-04 | Money stored as integer cents            | GAP-03, NFR-02    | [../decisions/2026-10-11-money-integer-cents.md](../decisions/2026-10-11-money-integer-cents.md)       |
| D-06 | Customer deletion cascades to orders     | GAP-04, FR-04     | [../decisions/2026-10-11-customer-deletion-cascade.md](../decisions/2026-10-11-customer-deletion-cascade.md) |
| D-10 | Unit price captured on each line         | GAP-14, A-09      | [../decisions/2026-10-11-price-snapshot-at-entry.md](../decisions/2026-10-11-price-snapshot-at-entry.md) |
| D-13 | createdAt and updatedAt, no audit log    | GAP-16            | [../decisions/2026-10-11-order-audit-timestamps.md](../decisions/2026-10-11-order-audit-timestamps.md) |
| D-20 | Storage object injected into repositories | AGENTS.md         | [../decisions/2026-10-11-injected-storage-repositories.md](../decisions/2026-10-11-injected-storage-repositories.md) |
| D-24 | User text rendered with textContent      | AGENTS.md, NFR-03 | [../decisions/2026-10-11-text-rendering-textcontent.md](../decisions/2026-10-11-text-rendering-textcontent.md) |

## Recorded From Inferred Rationale

These records are accepted on the closest rationale in the workspace documents. Items D-25 (360 px), D-28 (500 customers, 5,000 orders) and D-36 (Firefox single worker) are accepted by the builder. The others need builder confirmation. The PRD NFR-05 phone width now matches D-25.

| ID   | Decision                                          | Source            | Record                                                                                                  |
|------|---------------------------------------------------|-------------------|---------------------------------------------------------------------------------------------------------|
| D-02 | Status model: Draft, Confirmed, Cancelled         | GAP-02, BR-009    | [../decisions/2026-10-11-order-status-model.md](../decisions/2026-10-11-order-status-model.md)         |
| D-03 | Confirmed orders cannot return to Draft           | A-08              | [../decisions/2026-10-11-order-status-one-way.md](../decisions/2026-10-11-order-status-one-way.md)     |
| D-05 | One configured currency, USD default              | GAP-03            | [../decisions/2026-10-11-single-currency.md](../decisions/2026-10-11-single-currency.md)               |
| D-07 | Draft deleted, Confirmed cancelled and kept       | GAP-06, FR-12     | [../decisions/2026-10-11-order-delete-and-cancel-rule.md](../decisions/2026-10-11-order-delete-and-cancel-rule.md) |
| D-08 | Export and import out of scope, risk accepted     | GAP-07, NFR-08    | [../decisions/2026-10-11-export-import-out-of-scope.md](../decisions/2026-10-11-export-import-out-of-scope.md) |
| D-09 | Personal data stored unencrypted                  | GAP-08, NFR-06    | [../decisions/2026-10-11-personal-data-unencrypted.md](../decisions/2026-10-11-personal-data-unencrypted.md) |
| D-11 | Order total derived, never stored                 | BR-008, FR-08     | [../decisions/2026-10-11-derived-order-total.md](../decisions/2026-10-11-derived-order-total.md)       |
| D-12 | Order lines embedded in their order               | AGENTS.md         | [../decisions/2026-10-11-order-lines-embedded.md](../decisions/2026-10-11-order-lines-embedded.md)     |
| D-14 | At least one line before an order is saved        | A-06, FR-06       | [../decisions/2026-10-11-minimum-one-line-per-order.md](../decisions/2026-10-11-minimum-one-line-per-order.md) |
| D-15 | Line description limited to 500 characters        | A-07, FR-07       | [../decisions/2026-10-11-line-description-limit.md](../decisions/2026-10-11-line-description-limit.md) |
| D-16 | Validation limits (name, email, phone, quantity, price) | GAP-05      | [../decisions/2026-10-11-validation-limits.md](../decisions/2026-10-11-validation-limits.md)           |
| D-17 | Versioned storage with backup of corrupt data     | BR-014, FR-14     | [../decisions/2026-10-11-versioned-storage-backup.md](../decisions/2026-10-11-versioned-storage-backup.md) |
| D-18 | Save failures keep input and show a persistent error | BR-015, FR-15  | [../decisions/2026-10-11-save-failure-handling.md](../decisions/2026-10-11-save-failure-handling.md)   |
| D-19 | Persistence in localStorage behind repositories   | Raw req., A-03    | [../decisions/2026-10-11-localstorage-persistence.md](../decisions/2026-10-11-localstorage-persistence.md) |
| D-21 | Vanilla JavaScript, no framework, no build step   | A-04, BR-018      | [../decisions/2026-10-11-vanilla-js-no-build-step.md](../decisions/2026-10-11-vanilla-js-no-build-step.md) |
| D-22 | Node built-in test runner                         | README            | [../decisions/2026-10-11-node-test-runner.md](../decisions/2026-10-11-node-test-runner.md)             |
| D-23 | IDs generated with crypto.randomUUID()            | AGENTS.md         | [../decisions/2026-10-11-random-uuid-ids.md](../decisions/2026-10-11-random-uuid-ids.md)               |
| D-25 | Browser support list and 360 px minimum           | GAP-09, NFR-05    | [../decisions/2026-10-11-browser-support.md](../decisions/2026-10-11-browser-support.md)               |
| D-26 | Accessibility target WCAG 2.2 AA                  | GAP-10, NFR-04    | [../decisions/2026-10-11-accessibility-wcag-22-aa.md](../decisions/2026-10-11-accessibility-wcag-22-aa.md) |
| D-27 | English only, dates shown in user locale          | GAP-15            | [../decisions/2026-10-11-english-only-locale.md](../decisions/2026-10-11-english-only-locale.md)       |
| D-28 | Volume assumption of 500 customers, 5,000 orders  | GAP-11, NFR-01    | [../decisions/2026-10-11-volume-assumption.md](../decisions/2026-10-11-volume-assumption.md)           |
| D-29 | Timeline and estimates ignored for now            | GAP-12            | [../decisions/2026-10-11-defer-estimates.md](../decisions/2026-10-11-defer-estimates.md)               |
| D-30 | Dates stored as ISO 8601 strings                  | PRD Data Model    | [../decisions/2026-10-11-iso-8601-dates.md](../decisions/2026-10-11-iso-8601-dates.md)                 |
| D-31 | Write lock on failed backup or read, malformed data treated as unreadable | D-17, D-18, FR-14, FR-15 | [../decisions/2026-10-11-storage-recovery-rules.md](../decisions/2026-10-11-storage-recovery-rules.md) |
| D-32 | P3 build choices: native dialog, hash routing, add form on list, inline validation, form-level save alert, recovered banner on list | P3 plan; inferred | [../decisions/2026-10-12-p3-ui-approach.md](../decisions/2026-10-12-p3-ui-approach.md) |
| D-33 | P4 build choices: order form with first line, inline line editing, confirmation dialog for Confirm, combined status and customer filter | P4 plan; inferred | [../decisions/2026-10-12-p4-orders-ui.md](../decisions/2026-10-12-p4-orders-ui.md) |
| D-34 | P5 build choices: Tab wrap in confirm dialog, per-dialog message ids, focus return from line form, named scroll region, control border token, dark palette, reduced-motion guard | P5 plan; inferred | [../decisions/2026-10-12-p5-responsive-a11y.md](../decisions/2026-10-12-p5-responsive-a11y.md) |
| D-35 | Explicit opener focus return for confirm dialogs and the line form (WebKit) | P6 WebKit focus failures; inferred | [../decisions/2026-10-12-focus-restoration-webkit.md](../decisions/2026-10-12-focus-restoration-webkit.md) |
| D-36 | Firefox runs alone with one worker in `test:e2e` | P6 Firefox parallel failures; inferred | [../decisions/2026-10-12-firefox-single-worker.md](../decisions/2026-10-12-firefox-single-worker.md) |
| D-37 | Playwright for browser end-to-end tests, dev dependency only (added in P7 reconciliation; record had no row) | Record dated 2026-10-11; inferred | [../decisions/2026-10-11-playwright-browser-tests.md](../decisions/2026-10-11-playwright-browser-tests.md) |
