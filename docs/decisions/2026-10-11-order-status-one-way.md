---
title: Confirmed orders cannot return to Draft
description: Order status moves one way, so a Confirmed order cannot go back to Draft.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - orders
  - status
---

## Status

Accepted, with inferred reason. Builder to confirm.

## Context

Lines of a Confirmed order cannot change ([BRD BR-009](../brds/customer-order-brd.md)). The one-way rule is assumption A-08 in the [PRD](../requirements/refined/customer-order-prd.md).

## Options Considered

| Option           | Summary                                       | Trade-offs                                                                 |
|------------------|-----------------------------------------------|----------------------------------------------------------------------------|
| One-way status   | Confirmed cannot return to Draft.             | Keeps confirmed lines fixed. A mistake needs a cancel and a new order.     |
| Allow revert     | A Confirmed order can return to Draft.        | Lines become editable again, which BR-009 forbids for Confirmed orders.    |

## Decision

Status moves one way. A Confirmed order cannot return to Draft.

## Reason

Returning to Draft would make confirmed lines editable again, which BR-009 forbids. (Inferred.)

## Consequences

* No revert action in the UI.
* A mistake on a Confirmed order is handled by cancelling it ([PRD FR-09](../requirements/refined/customer-order-prd.md)).

## Assumptions and Risks

* A-08: Status moves one way only ([PRD A-08](../requirements/refined/customer-order-prd.md)).

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the workspace documents. Builder review pending.
