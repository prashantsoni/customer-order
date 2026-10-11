---
title: Orders require at least one line before saving
description: An order cannot be saved without at least one line, and its last line cannot be removed.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - orders
  - validation
---

## Status

Accepted, with inferred reason. Builder to confirm.

## Context

The order form must require a first line ([PRD FR-06](../requirements/refined/customer-order-prd.md)). Assumption A-06 records the rule ([PRD A-06](../requirements/refined/customer-order-prd.md)).

## Options Considered

| Option             | Summary                                               | Trade-offs                                                              |
|--------------------|-------------------------------------------------------|-------------------------------------------------------------------------|
| Require one line   | An order is saved only with at least one line.        | Every order has a total. The form asks for a first line up front.       |
| Allow empty orders | An order can be saved with no lines.                  | Totals of zero, with no content. (Inferred option.)                     |

## Decision

An order must have at least one line before it is saved. The last line cannot be removed.

## Reason

An order with no lines has no content to total. (Inferred.)

## Consequences

* The order form requires the first line ([PRD FR-06](../requirements/refined/customer-order-prd.md)).
* Removing the last line is blocked ([PRD FR-07](../requirements/refined/customer-order-prd.md)).

## Assumptions and Risks

* A-06: confirmed in the PRD. The reason is inferred.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the workspace documents. Builder review pending.
