---
title: Delete a customer together with their orders
description: Deleting a customer also deletes their orders, after a confirmation that states how many orders will be removed.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - customers
  - orders
  - deletion
---

## Status

Accepted.

## Context

Orders belong to a customer. Deleting a customer must not leave orphan orders ([BRD BR-004](../brds/customer-order-brd.md), [PRD FR-04](../requirements/refined/customer-order-prd.md)). The deletion rule was open in the BRD and is now closed ([GAP-04](../brds/customer-order-brd.md)).

## Options Considered

| Option        | Summary                                                                                  | Trade-offs                                                                                                      |
|---------------|------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| Block deletion | Refuse to delete a customer who has orders.                                             | A customer with a Confirmed or Cancelled order could never be deleted, because those orders are kept.          |
| Cascade delete | Delete the customer and all their orders in one save, after a confirmation.             | Order history is removed with the customer. The confirmation states the order count before anything is removed. |

## Decision

Deleting a customer also deletes their orders. The app asks for confirmation first and states how many orders will be removed.

## Reason

Blocking deletion would leave a customer with a Confirmed or Cancelled order undeletable ([GAP-04](../brds/customer-order-brd.md)). The cascade with confirmation removes the customer and their orders together, so no orphan orders remain.

## Consequences

* The customer and all their orders are removed in one save ([PRD FR-04](../requirements/refined/customer-order-prd.md)).
* If the save fails, nothing is removed ([PRD FR-04](../requirements/refined/customer-order-prd.md), FR-15).
* The confirmation dialog shows the order count, which can be zero.

## Assumptions and Risks

* Accepted risk: order history is removed with the customer. No export exists in this release ([GAP-07](../brds/customer-order-brd.md), R-01).

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the BRD and PRD text. Builder review pending.
