---
title: Order status model: Draft, Confirmed, Cancelled
description: Orders move through three statuses, and lines can be changed only while an order is in Draft.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - orders
  - status
---

## Status

Accepted, with inferred options and reason. Builder to confirm.

## Context

Order status needs defined values and transitions ([BRD BR-009](../brds/customer-order-brd.md), [GAP-02](../brds/customer-order-brd.md)). The status rules are in the [PRD](../requirements/refined/customer-order-prd.md).

## Options Considered

| Option                                  | Summary                                                       | Trade-offs                                                                 |
|-----------------------------------------|---------------------------------------------------------------|----------------------------------------------------------------------------|
| Three statuses: Draft, Confirmed, Cancelled | Draft is editable. Confirmed and Cancelled are read-only.  | Matches the order lifecycle in the PRD. Needs one extra step to finalise.  |
| Two statuses: Open, Closed              | Open orders are editable. Closed orders are read-only.        | Simpler. Cannot tell a cancelled order from a completed one. (Inferred option.) |

## Decision

Orders have three statuses: Draft, Confirmed and Cancelled. Lines can be added, edited or removed only in Draft.

## Reason

Draft keeps unfinished orders apart from final ones. Cancelled keeps a record of an order that no longer applies, which [GAP-06](../brds/customer-order-brd.md) requires for history. (Inferred from the BRD.)

## Consequences

* Status controls edit rights ([PRD FR-09](../requirements/refined/customer-order-prd.md)).
* The order list can filter by status ([PRD FR-10](../requirements/refined/customer-order-prd.md)).

## Assumptions and Risks

* Inferred: the reason is drawn from GAP-06. The two-status option is not in the documents.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the workspace documents. Builder review pending.
