---
title: Customer Order Manager BRD
description: Business requirements, gap analysis and recommendations for the local customer and order manager
author: Prashant
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - BRD
  - customers
  - orders
  - localStorage
---

## Document Control

| Field       | Value                                 |
|-------------|---------------------------------------|
| Version     | 0.1 (draft)                           |
| Status      | Draft for review                      |
| Sources     | README.md, raw-requirement.txt        |
| Owner       | Prashant                              |
| Last update | 2026-10-11                            |

## Business Context and Background

The business needs a light, browser-only tool to record customers, the orders they place, and the order lines in each order. The raw requirement asks for a local JavaScript application that uses `localStorage` for persistence. It leaves the user experience, data model and implementation approach to the builder.

The initiative is also an assessed exercise on AI-assisted delivery. Evidence of engineering ownership is therefore a business requirement (see BR-019 to BR-021).

## Problem Statement and Business Drivers

Customer contacts, orders and order totals are not held in one simple tool that needs no server, account or install. Totals must be worked out by hand, and there is no single place to search them.

Business drivers:

* Simplicity: the tool runs in a browser with no server or account.
* Low cost: no hosting, licences or infrastructure.
* Assessment: the build must show clear reasoning, review and ownership of AI-generated code.

## Business Objectives and Success Metrics

| ID   | Objective                                   | Metric                                               | Baseline | Target                                                  | Timeframe     |
|------|---------------------------------------------|------------------------------------------------------|----------|---------------------------------------------------------|---------------|
| O-01 | Maintain customer records locally           | Customers and orders survive reload                  | None     | All BR-001 to BR-004 and BR-013 acceptance criteria pass | TBD (GAP-12)  |
| O-02 | Record orders and calculate totals correctly | Total matches sum of line totals in cents            | None     | Zero mismatches in domain tests                         | TBD (GAP-12)  |
| O-03 | Find customers and orders quickly           | Search and filter update without a page reload       | None     | Results shown for 500 customers and 5,000 orders        | TBD (GAP-12)  |
| O-04 | Show engineering ownership of AI-assisted delivery | Decisions, reviews and AI usage recorded       | None     | A decision record and review note for each major choice | TBD (GAP-12)  |

## Stakeholders and Roles

| Stakeholder          | Role                                                   | Interest                                       | Influence |
|----------------------|--------------------------------------------------------|------------------------------------------------|-----------|
| Primary user         | Records customers and orders in one browser (assumed)  | Fast, reliable record keeping                  | High      |
| Assessor             | Evaluates the exercise                                 | Ownership, quality, clear communication        | High      |
| Builder              | Plans, builds, tests and reviews the app with AI       | Coherent app, sound reasoning                  | High      |
| Code reviewer        | Reviews generated code and records findings            | Correctness and code quality                   | Medium    |

## Scope

### In Scope

* Customers: create, view, edit, delete (subject to GAP-04), search.
* Orders: create for a customer, set status, view, filter, cancel or delete (subject to GAP-06).
* Order lines: add, edit and remove. Order totals are derived.
* Persistence in browser `localStorage`, with versioned data.
* Empty, validation and error states.
* Local run with no server.

### Out of Scope

* Authentication, user accounts and roles.
* Multi-user or multi-device sync.
* Backend APIs and databases.
* Payments, invoices, tax and discounts.
* Inventory and product catalogue.
* Import and export of data (decided: out of scope, see GAP-07).

## Current and Future Business Processes

There is no current process to replace. The future process is:

1. Open the app in a browser at the local address.
2. Create a customer, or search for an existing one.
3. Open the customer and create an order.
4. Add order lines. The total updates after each change.
5. Set the order status as it progresses, for example Confirmed or Cancelled.
6. Return later. The data is still in the same browser.

## Business Requirements

Priority values: High (needed for the first release), Medium (should be delivered), Low (could be delivered).

### Customers

* BR-001 (High, O-01): Create a customer with a required name and optional email and phone.
  * Acceptance: a blank name shows an inline error and is not saved. An invalid email shows an inline error. A saved customer appears in the list.
* BR-002 (High, O-01): View a list of customers and a detail view for each customer.
  * Acceptance: the list shows name, email and phone. An empty state appears when there are no customers.
* BR-003 (High, O-01): Edit a customer's details.
  * Acceptance: changes persist after reload. The same validation as BR-001 applies.
* BR-004 (High, O-01): Delete a customer and their orders under the rule set in GAP-04.
  * Acceptance: deletion asks for confirmation and states how many orders will be removed. No orphan orders remain.
* BR-005 (High, O-03): Search customers by name or email.
  * Acceptance: matching is case-insensitive and partial. A search with no match shows a message, not a blank list.

### Orders

* BR-006 (High, O-02): Create an order for an existing customer.
  * Acceptance: an order cannot be created without a customer. A new order starts in Draft (GAP-02).
* BR-007 (High, O-02): Add, edit and remove order lines.
  * Acceptance: description is required. Quantity is a whole number of at least 1. Unit price is zero or more and is stored in cents. Invalid input is blocked with an inline error.
* BR-008 (High, O-02): Show each order total, derived from its lines.
  * Acceptance: the total equals the sum of quantity times unit price in cents. The total updates after every line change. The total is not stored.
* BR-009 (Medium, O-02): Track order status with defined values and transitions.
  * Acceptance: statuses are Draft, Confirmed and Cancelled (GAP-02). Lines of a Confirmed or Cancelled order cannot be changed.
* BR-010 (Medium, O-03): Filter orders by status and search them by customer name.
  * Acceptance: filters combine. Every result matches all active criteria.
* BR-011 (Medium, O-03): List the orders of a customer on the customer detail view.
  * Acceptance: each order shows its status and total.
* BR-012 (Medium, O-02): Delete or cancel orders under the rule set in GAP-06.
  * Acceptance: deletion of a Draft order asks for confirmation. Confirmed orders are cancelled, not removed.

### Data and Quality

* BR-013 (High, O-01): Keep all data in the browser so it survives reload.
  * Acceptance: data is present after reload and after the tab is closed and reopened. No network calls are made to store data.
* BR-014 (High, O-01): Version stored data and recover from corrupt or missing data.
  * Acceptance: corrupt data does not crash the app. The corrupt data is backed up, and the user sees a warning and an empty state.
* BR-015 (High, O-01): Tell the user when a save fails.
  * Acceptance: a quota or write error shows a visible message. Entered values are kept. No change is lost silently.
* BR-016 (High, O-01): Show empty and error states on every list and form.
  * Acceptance: each list and form has a defined empty or error state, checked in a manual browser test.
* BR-017 (Medium, O-03): Work on desktop and tablet widths, with keyboard access.
  * Acceptance: the app is usable at 360 px width. Every action can be reached with the keyboard. Meets GAP-09 and GAP-10.
* BR-018 (High, O-04): Run locally with no server, no build step and no runtime dependency.
  * Acceptance: `npm start` serves the app. `package.json` lists no runtime dependencies.

### Exercise Evidence

* BR-019 (High, O-04): Record decisions and assumptions in `docs/decisions/`.
  * Acceptance: each major decision has a dated record that states the options and the reason for the choice.
* BR-020 (High, O-02, O-04): Cover totals, validation and search or filter with automated tests.
  * Acceptance: `npm test` passes. Each change to these areas includes tests.
* BR-021 (High, O-04): Record the AI tools used, including the LLM, and review notes for generated code.
  * Acceptance: `docs/reviews/` holds review notes. The session record names the LLM used for each phase.

## Data and Reporting Requirements

Data needs, taken from the README draft and to be confirmed:

| Entity     | Required data                                  | Notes                                             |
|------------|------------------------------------------------|---------------------------------------------------|
| Customer   | `id`, `name`, `email`, `phone`, `createdAt`    | Name required. Email and phone optional.          |
| Order      | `id`, `customerId`, `status`, `createdAt`, `lines` | Status values: Draft, Confirmed, Cancelled (GAP-02).                 |
| Order line | `id`, `description`, `quantity`, `unitPriceCents`  | Price captured at entry (GAP-14).             |
| Stored document | `schemaVersion`                           | Required for BR-014.                              |

Reporting: no reports beyond the total per order and the order list per customer. Money is shown in one currency (GAP-03).

## Gap Analysis and Recommendations

The raw requirement leaves the decisions below open. Each gap has a recommendation for confirmation.

Priority: High blocks design or build. Medium affects quality. Low is a refinement.

* GAP-01 (Closed): Users and roles.
  * Decision: one user per browser, with no login.
* GAP-02 (Closed): Order statuses and transitions.
  * Decision: Draft, Confirmed and Cancelled. Lines are editable in Draft only. Confirmed and Cancelled orders are read-only.
* GAP-03 (Closed): Currency, rounding and display format.
  * Decision: one currency, set in a single configuration constant that defaults to USD. Store integer cents and format only when rendering. Quantities are whole numbers, so no rounding is needed.
* GAP-04 (Closed): Customer deletion rule.
  * Decision: deleting a customer also deletes their orders, after a confirmation that states how many orders will be removed. Blocking deletion was rejected because a customer with a Confirmed or Cancelled order could never be deleted.
* GAP-05 (High): Validation rules are incomplete.
  * Why it matters: affects BR-001, BR-003 and BR-007.
  * Recommendation: name required, up to 100 characters. Email optional, basic format check, unique without regard to case. Phone optional, up to 30 characters of digits and common symbols. Quantity is a whole number from 1 to 9999. Unit price is zero or more, up to a set maximum (proposed 100,000.00).
* GAP-06 (Medium): Order deletion and cancellation rules are not stated.
  * Why it matters: affects BR-012.
  * Recommendation: a Draft order can be deleted after confirmation. A Confirmed order is cancelled and kept for history.
* GAP-07 (Closed, out of scope): There is no export, import or backup. `localStorage` can be cleared by the browser and has a size limit (about 5 MB per origin, browser-dependent).
  * Why it matters: data loss risk, and no way to move data between browsers.
  * Decision: export and import are out of scope. Record the data loss risk as accepted in `docs/decisions/`.
* GAP-08 (Medium): Personal data (names, emails and phone numbers) is stored unencrypted in the browser.
  * Why it matters: privacy and data protection.
  * Recommendation: limit fields to contact details. Record in the decision log that the data is local and unencrypted.
* GAP-09 (Medium): Browser and device support is not stated.
  * Why it matters: affects BR-017 and the testing effort.
  * Recommendation: current Chrome, Edge, Firefox and Safari. Desktop and tablet, with phone use down to 360 px.
* GAP-10 (Medium): The accessibility target is not stated.
  * Why it matters: affects forms, labels and error messages.
  * Recommendation: target WCAG 2.2 AA for forms, labels, focus and error messages.
* GAP-11 (Low): Data volume and performance are not stated.
  * Why it matters: affects the storage design and the search approach.
  * Recommendation: assume up to 500 customers and 5,000 orders, with results shown within 300 ms at that size. Confirm.
* GAP-12 (Deferred): There is no timeline, effort estimate or deadline.
  * Decision: estimates are ignored for now. Revisit before planning begins.
* GAP-13 (Medium): The exercise deliverables are not listed.
  * Why it matters: assessed evidence may be missed.
  * Recommendation: use BR-019 to BR-021 as the deliverable checklist.
* GAP-14 (Medium): Price source is not defined. Lines hold free text and a price.
  * Why it matters: a later price change could alter past orders.
  * Recommendation: capture the price on each line at entry (a snapshot). No product catalogue is in scope.
* GAP-15 (Low): Language and locale are not defined.
  * Why it matters: affects copy and date formats.
  * Recommendation: English only. Show dates in the user's locale.
* GAP-16 (Low): There is no audit trail. Only `createdAt` is stored.
  * Why it matters: limits history and support.
  * Recommendation: add `updatedAt` to customers and orders. A full audit log is out of scope.

## Assumptions

* A-01: One user per browser, with no login (source: raw requirement, local application).
* A-02: Browser only, with no server (source: raw requirement).
* A-03: Data is stored in `localStorage` on one device (source: raw requirement).
* A-04: Vanilla JavaScript with no framework (source: README tech choices).
* A-05: Scope is limited to the raw requirement. README out-of-scope items stay out (source: README).

## Risks and Mitigations

| ID   | Risk                                          | Likelihood | Impact | Mitigation                                                    |
|------|-----------------------------------------------|------------|--------|---------------------------------------------------------------|
| R-01 | Data loss when browser storage is cleared     | Medium     | High   | Versioned data and warnings (BR-014); export out of scope, risk accepted (GAP-07) |
| R-02 | Money or total errors in generated code       | Medium     | High   | Integer cents, domain tests (BR-020), line-by-line review (BR-021) |
| R-03 | Scope creep beyond the light scope            | Medium     | Medium | Out-of-scope list (this BRD) and decision log (BR-019)        |
| R-04 | Unencrypted personal data in browser storage  | Low        | Medium | Limit fields and record the decision (GAP-08)                 |
| R-05 | Time pressure reduces review quality          | Medium     | Medium | Time-box the build (GAP-12) and treat reviews as deliverables (BR-021) |

## Open Questions

1. Resolved: one user per browser, with no login (GAP-01).
2. Resolved: statuses are Draft, Confirmed and Cancelled (GAP-02).
3. Resolved: one currency, defaulting to USD (GAP-03).
4. Resolved: deleting a customer also deletes their orders after confirmation (GAP-04).
5. Resolved: export and import are out of scope (GAP-07).
6. Deferred: timeline and estimates are ignored for now (GAP-12).

## Quality Gates

| Check                                              | Status                                   |
|----------------------------------------------------|------------------------------------------|
| Required sections complete                         | Complete (draft)                         |
| Requirements linked to objectives                  | Complete                                 |
| Objectives have baselines and targets with timeframes | Partial: timeframes deferred (GAP-12)    |
| Stakeholders documented                            | Complete (single user, GAP-01)  |
| Risks identified with mitigations                  | Complete                                 |
