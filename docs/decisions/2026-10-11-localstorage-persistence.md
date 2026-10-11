---
title: Persist data in localStorage behind repositories
description: All data is saved to browser localStorage through repository modules.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - storage
  - localStorage
---

## Status

Accepted, with inferred option. Builder to confirm.

## Context

The raw requirement asks for a local application that uses localStorage ([raw requirement](../requirements/raw/raw-requirement.txt)). Repositories wrap the storage ([README Tech Choices](../../README.md)).

## Options Considered

| Option        | Summary                                                  | Trade-offs                                                                   |
|---------------|----------------------------------------------------------|------------------------------------------------------------------------------|
| localStorage  | Synchronous browser storage, wrapped in repositories.    | Simple. Size limit of about 5 MB per origin ([GAP-07](../brds/customer-order-brd.md)). |
| IndexedDB     | Browser database with a larger size limit. (Inferred option.) | Larger capacity. More code. Not what the raw requirement names.         |

## Decision

Persist all data in localStorage. Access it only through repositories in `src/js/storage/`.

## Reason

The raw requirement asks for localStorage ([raw requirement](../requirements/raw/raw-requirement.txt)).

## Consequences

* Data size must stay within the limit ([PRD NFR-07](../requirements/refined/customer-order-prd.md)).
* Only the storage layer uses `localStorage` ([D-20](2026-10-11-injected-storage-repositories.md)).

## Assumptions and Risks

* Accepted risk R-01: browser storage can be cleared ([BRD R-01](../brds/customer-order-brd.md)).

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the workspace documents. Builder review pending.
