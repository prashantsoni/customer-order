---
title: Line descriptions limited to 500 characters
description: A line description is required and holds 1 to 500 characters after trimming.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - validation
  - order lines
---

## Status

Accepted, with inferred reason. Builder to confirm.

## Context

Line descriptions are required free text ([BRD BR-007](../brds/customer-order-brd.md)). Assumption A-07 sets the limit ([PRD A-07](../requirements/refined/customer-order-prd.md)).

## Options Considered

| Option           | Summary                                  | Trade-offs                                                        |
|------------------|------------------------------------------|-------------------------------------------------------------------|
| 500 characters   | Trimmed text of 1 to 500 characters.     | Room for a clear item description. Bounds storage use.            |
| 100 characters   | Same limit as a customer name.           | Too short for many item descriptions. (Inferred option.)          |
| No limit         | Any length is accepted.                  | Unbounded input against the storage limit. (Inferred option.)     |

## Decision

A line description must be 1 to 500 characters after trimming.

## Reason

Free text needs more room than a name, which has a 100-character limit ([GAP-05](../brds/customer-order-brd.md)). The limit keeps storage use bounded ([NFR-07](../requirements/refined/customer-order-prd.md)). (Inferred.)

## Consequences

* Validation returns an inline error when the limit is exceeded ([PRD FR-07](../requirements/refined/customer-order-prd.md)).
* Domain tests cover the limit ([PRD DR-02](../requirements/refined/customer-order-prd.md)).

## Assumptions and Risks

* A-07: confirmed in the PRD. The reason is inferred.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the workspace documents. Builder review pending.
