---
title: Customer Order Manager
description: Simple local JavaScript app for managing customers, orders and order lines using localStorage
---

## Overview

A light, browser-only application to manage customers, their orders, and the order lines in each order. All data is stored in the browser's `localStorage`; there is no server or database.

Source requirement: [docs/requirements/raw/raw-requirement.txt](docs/requirements/raw/raw-requirement.txt).
Business requirements: [docs/brds/customer-order-brd.md](docs/brds/customer-order-brd.md).
Product requirements: [docs/requirements/refined/customer-order-prd.md](docs/requirements/refined/customer-order-prd.md).
Agent and coding rules: [AGENTS.md](AGENTS.md).

**Status:** The app, unit tests and browser tests are written. Responsive layouts and the six PRD journeys were reviewed in the browser. Remaining accessibility checks: zoom at 200% and 400%, a screen-reader pass, and Windows High Contrast. See the [implementation plan](docs/plan/implementation-plan.md).

## Scope

* Create, edit, view and delete customers.
* Create orders for a customer.
* Add, edit and remove order lines on an order.
* Calculate order totals.
* Confirm or cancel orders, and delete draft orders.
* Search and filter customers and orders.
* Basic validation plus useful empty and error states.

Out of scope: authentication, multi-user sync, backend APIs, payments, invoices, tax, discounts, inventory, import and export, and multiple currencies. The PRD non-goals list has the full set.

## Tech Choices

* Vanilla JavaScript (ES modules), HTML and CSS. No framework and no build step.
* `localStorage` for persistence, wrapped behind repositories.
* Node's built-in test runner (`node --test`) for domain and storage logic.
* Playwright for browser end-to-end tests (`npm run test:e2e`).
* Target browsers: current Chrome, Edge, Firefox and Safari on desktop and tablet, and on phones down to 360px wide.

Rationale and trade-offs are recorded in [docs/decisions/](docs/decisions/).

## Getting Started

Prerequisite: Node.js 20 or later.

### Run the app

1. Install the project dependencies:

   ```bash
   npm install
   ```

2. Start the local web server:

   ```bash
   npm start
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

The app runs locally in your browser and stores its data in `localStorage`.

### Run tests

```bash
npm test
npx playwright install chromium firefox webkit
npm run test:e2e
```

## Testing

* Unit tests cover the domain and storage modules. `npm test` runs them with Node's test runner and needs no browser.
* Browser tests use Playwright (`npm run test:e2e`). The run covers four projects: `desktop-chromium`, `desktop-webkit`, `phone-360`, and `desktop-firefox`. `npm run test:e2e` runs Firefox in a second command with one worker, because parallel Firefox runs failed (see the [Firefox decision](docs/decisions/2026-10-12-firefox-single-worker.md)). Specs are in `tests/e2e/`. Setup is in `playwright.config.js`. See the [Playwright decision](docs/decisions/2026-10-11-playwright-browser-tests.md).

## Architecture

```text
+--------------------------+
| User (one browser)       |
+--------------------------+
             |
             v
+------------------------------------------------------------+
| main.js: bootstrap, hash routing, composition root         |
+------------------------------------------------------------+
             |
             v
+------------------------------------------------------------+
| ui/views: customers, customer detail, order detail         |
| ui/components: form, table, empty state, confirm dialog    |
+------------------------------------------------------------+
             |                                 |
             v                                 v
+--------------------------+      +--------------------------+
| Domain (pure logic)      |      | Storage (repositories)   |
| entities, validation     |<-----| customer and order repos |
| orderTotalCents          |      | injected storage object  |
| search and filter        |      | schemaVersion, backup    |
| customerDeletionImpact   |      | touches localStorage     |
| no DOM, no localStorage  |      |                          |
+--------------------------+      +--------------------------+
                                               |
                                               v
+--------------------------+      +--------------------------+
| Tests (dev only)         |      | Browser localStorage     |
| node --test: domain      |      | key: customer-order:v1   |
| storage (fake storage)   |      | backup: corrupt-<ts>     |
| Playwright: browser e2e  |      |                          |
+--------------------------+      +--------------------------+

+------------------------------------------------------------+
| utils/: money formatting, el() helper, ids                 |
| imported by ui/ and storage/                               |
+------------------------------------------------------------+
```

* Dependencies point one way: `ui/` uses `domain/`, `storage/` and `utils/`; `storage/` uses `domain/` and `utils/`; `domain/` uses nothing.
* `main.js` passes the real `localStorage` into the repositories at bootstrap. Tests pass an in-memory fake instead.
* Order totals and validation are computed in `domain/` and never stored.

## Folder Structure

```text
customer-order/
├── AGENTS.md              # Instructions for AI coding agents
├── README.md
├── package.json
├── playwright.config.js
├── .github/               # Coding rules for AI agents, by folder
├── docs/
│   ├── brds/              # Business requirements document
│   ├── requirements/
│   │   ├── raw/           # Original requirement text
│   │   └── refined/       # Product requirements (PRD) and assumptions
│   ├── plan/              # Implementation plan and task breakdown
│   ├── decisions/         # Decision records (data model, UX, AI usage)
│   └── reviews/           # Review notes on AI-generated code
├── src/
│   ├── index.html
│   ├── css/
│   └── js/
│       ├── main.js        # Bootstrap and routing
│       ├── domain/        # Entities, validation, totals (pure logic)
│       ├── storage/       # localStorage wrapper and repositories
│       ├── ui/
│       │   ├── views/     # Customers, orders, order detail screens
│       │   └── components/# Reusable UI pieces (forms, tables, empty states)
│       └── utils/         # Money, ids, formatting helpers
└── tests/
    ├── domain/
    ├── storage/
    └── e2e/           # Playwright browser tests
```

## Data Model

| Entity          | Key fields                                                        |
|-----------------|-------------------------------------------------------------------|
| Customer        | `id`, `name`, `email`, `phone`, `createdAt`, `updatedAt`          |
| Order           | `id`, `customerId`, `status`, `createdAt`, `updatedAt`, `lines[]` |
| OrderLine       | `id`, `description`, `quantity`, `unitPriceCents`                 |
| Stored document | `schemaVersion`, `customers`, `orders`                            |

* Order total is derived, never stored: the sum of `quantity * unitPriceCents` over all lines.
* Order status moves from Draft to Confirmed to Cancelled. Draft orders are deleted, not cancelled.
* Lines can be added, edited or removed only while the order is in Draft.
* Money is stored as integer cents. Dates are ISO 8601 strings.
* Deleting a customer also deletes that customer's orders.

The full field rules are in the [PRD data model](docs/requirements/refined/customer-order-prd.md#data-model).

## Known Limitations

* All data stays in one browser on one device. Clearing site data deletes it, and no export exists in this release ([export and import decision](docs/decisions/2026-10-11-export-import-out-of-scope.md)).
* Names, emails and phone numbers are stored unencrypted ([personal data decision](docs/decisions/2026-10-11-personal-data-unencrypted.md)).
* `localStorage` allows about 5 MB per origin, depending on the browser.
