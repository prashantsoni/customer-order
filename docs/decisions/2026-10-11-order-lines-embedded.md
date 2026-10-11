---
title: Order lines embedded in their order
description: Order lines are stored in an array on each order, not in a separate collection.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - data model
  - order lines
---

## Status

Accepted, with inferred options and reason. Builder to confirm.

## Context

Order lines belong to one order and have no use outside it ([BRD BR-007](../brds/customer-order-brd.md)). The data model lists `lines[]` on the order ([PRD Data Model](../requirements/refined/customer-order-prd.md)).

## Options Considered

| Option                    | Summary                                             | Trade-offs                                                                 |
|---------------------------|-----------------------------------------------------|----------------------------------------------------------------------------|
| Embedded `lines[]`        | Lines are stored inside the order.                  | One save keeps order and lines consistent. Every line change saves the order. |
| Separate lines collection | Lines are stored apart and linked by order ID.      | Finer writes. Needs extra care to avoid orphan lines. (Inferred option.)   |

## Decision

Order lines are stored in `lines[]` on their order.

## Reason

An order and its lines are read and changed together. One save keeps them consistent, the same approach as [PRD FR-04](../requirements/refined/customer-order-prd.md). (Inferred.)

## Consequences

* A line change saves the whole order.
* Deleting an order removes its lines with it.

## Assumptions and Risks

* Inferred: the reason is not stated in the documents.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the workspace documents. Builder review pending.
