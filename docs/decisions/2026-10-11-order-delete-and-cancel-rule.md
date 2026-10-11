---
title: Delete Draft orders and cancel Confirmed orders
description: A Draft order is deleted after confirmation. A Confirmed order is cancelled and kept for history.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - orders
  - deletion
  - cancellation
---

## Status

Accepted, with inferred options. Builder to confirm.

## Context

Draft and Confirmed orders need different handling on removal ([BRD BR-012](../brds/customer-order-brd.md), [GAP-06](../brds/customer-order-brd.md)).

## Options Considered

| Option                              | Summary                                                 | Trade-offs                                                                 |
|-------------------------------------|---------------------------------------------------------|----------------------------------------------------------------------------|
| Delete Draft, cancel Confirmed      | Draft is deleted. Confirmed is cancelled and kept.      | Keeps history for confirmed orders. Cancelled orders stay in the list.     |
| Delete any order, including Confirmed | Every order can be deleted.                           | Loses history. (Inferred option.)                                          |

## Decision

A Draft order is deleted after confirmation. A Confirmed order is cancelled after confirmation and kept.

## Reason

Confirmed orders are kept for history ([GAP-06](../brds/customer-order-brd.md)). Deleting a Draft removes only unfinished work. (Inferred.)

## Consequences

* A Cancelled order cannot be changed further ([PRD FR-12](../requirements/refined/customer-order-prd.md)).
* Deleting a customer still removes their orders ([D-06](2026-10-11-customer-deletion-cascade.md)).

## Assumptions and Risks

* Inferred: the reason for deleting only Draft orders is not stated in the documents.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the workspace documents. Builder review pending.
