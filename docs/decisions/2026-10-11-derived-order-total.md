---
title: Order total derived, never stored
description: The order total is calculated from the order lines each time it is needed.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - totals
  - data model
---

## Status

Accepted, with inferred reason. Builder to confirm.

## Context

Each order shows a total that updates after every line change ([BRD BR-008](../brds/customer-order-brd.md), [PRD FR-08](../requirements/refined/customer-order-prd.md)).

## Options Considered

| Option           | Summary                                                       | Trade-offs                                                               |
|------------------|---------------------------------------------------------------|--------------------------------------------------------------------------|
| Derived on read  | Sum `quantity * unitPriceCents` each time the total is shown. | Always matches the lines. Costs a small calculation per display.         |
| Stored total     | Save the total and update it on each line change.             | Can drift from the lines if one update is missed. (Inferred risk.)       |

## Decision

The order total is derived from the lines and is never stored.

## Reason

The BRD states the total is not stored ([BR-008](../brds/customer-order-brd.md)). A stored total could drift from the lines. (Inferred.)

## Consequences

* Totals are calculated in the domain layer and covered by tests ([BRD BR-020](../brds/customer-order-brd.md)).
* The order list and detail view both show the derived total.

## Assumptions and Risks

* Inferred: the drift reason is not stated in the documents.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the workspace documents. Builder review pending.
