---
title: Agent Instructions
description: Guidance for AI coding agents working on the customer-order app
---

Local, browser-only JavaScript app to manage customers, orders and order lines. Persistence is `localStorage`; there is no backend. Requirements: [docs/requirements/raw/raw-requirement.txt](docs/requirements/raw/raw-requirement.txt). Overview and run steps: [README.md](README.md).

## Commands

* `npm start` serves `src/` at `http://localhost:5173` (ES modules do not load over `file://`).
* `npm test` runs `node --test` against the domain and storage modules (no browser needed).

## Architecture

* `src/js/domain/`: pure business logic (entities, validation, order totals). No DOM, no `localStorage`.
* `src/js/storage/`: the only code that touches `localStorage`; repositories are injected with a storage object so tests can pass an in-memory fake.
* `src/js/ui/`: views and components; render from state and call domain/storage, never compute totals inline.
* `src/js/main.js`: bootstrap and routing.
* Vanilla JS, ES modules, no framework, no build step, no runtime dependencies. Do not add any without asking.

## Conventions

* Order lines are embedded in their order (`order.lines[]`); order totals are derived, never stored.
* Money is stored as integer minor units (cents) and formatted only at render time, to avoid float errors.
* IDs are generated with `crypto.randomUUID()`.
* Deleting a customer with orders must be blocked or explicitly cascade; never leave orphan orders.
* Every list view needs an empty state; every form needs inline validation and a user-visible error state.
* Escape user-provided text when rendering (use `textContent`, not `innerHTML`).
* Persisted data is versioned (`schemaVersion`); handle corrupt or missing `localStorage` JSON without crashing.

## Process expectations

* The exercise is judged on engineering ownership: review all generated code, fix poor output, and record assumptions and decisions in `docs/decisions/`.
* Add tests for domain logic (totals, validation, search/filter) with every change to it.
