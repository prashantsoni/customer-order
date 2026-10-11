---
title: Application Source
description: Layout and architectural boundaries for the customer-order application source.
---

## Layout

* `index.html`: application document and Content Security Policy
* `css/`: application styles
* `js/main.js`: application bootstrap
* `js/domain/`: pure customer, order, validation, search, and totals logic
* `js/storage/`: versioned persistence and customer/order repositories
* `js/ui/`: application shell, views, and reusable UI components
* `js/utils/`: shared DOM, route, date, money, and configuration helpers

## Boundaries

Domain logic does not access the DOM or browser storage. Storage owns persistence and receives its storage adapter at the composition root. UI code renders repository and domain results; it does not reimplement validation, search, filtering, or order totals. Render user-provided text as text, not HTML.

Money is stored as integer cents, order totals are derived from order lines, and persisted data is versioned. Run `npm start` from the repository root to serve the app locally, and `npm run check` to run the source checks.
