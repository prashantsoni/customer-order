---
title: Inject a storage object into repositories
description: Repositories receive a storage object so tests can use an in-memory fake, and only the storage layer touches localStorage.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - storage
  - testing
---

## Status

Accepted.

## Context

Domain and storage tests run with `node --test` and no browser ([AGENTS.md](../../AGENTS.md) Commands). The storage layer is the only code that touches `localStorage` ([AGENTS.md](../../AGENTS.md) Architecture). Persistence requirements are in [BRD BR-013](../brds/customer-order-brd.md) and [PRD FR-13](../requirements/refined/customer-order-prd.md).

## Options Considered

| Option                    | Summary                                                                                 | Trade-offs                                                                           |
|---------------------------|-----------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| Injected storage object   | Repositories receive a storage object. Tests pass an in-memory fake.                    | Each repository takes a parameter. Tests run without a browser.                      |
| Direct localStorage calls | Repositories and other modules call `localStorage` directly.                            | Tests need a browser or a global stub. Storage access spreads across modules.        |

## Decision

Repositories in `src/js/storage/` receive a storage object. Only that folder uses `localStorage`.

## Reason

Tests run in Node without a browser, using an in-memory fake ([AGENTS.md](../../AGENTS.md)).

## Consequences

* Storage tests use the fake storage object in `tests/storage/`.
* The real `localStorage` object is passed in only at bootstrap.

## Assumptions and Risks

* No accepted risks are recorded for this decision.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the AGENTS.md text. Builder review pending.
