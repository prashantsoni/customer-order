---
title: Store money as integer cents
description: Amounts are stored as integer cents and formatted only when they are rendered.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - money
  - data model
---

## Status

Accepted.

## Context

Order totals must equal the sum of line totals in cents, with zero mismatches in domain tests ([BRD O-02](../brds/customer-order-brd.md), [PRD NFR-02](../requirements/refined/customer-order-prd.md)). Money handling is set in [GAP-03](../brds/customer-order-brd.md). The totals rule is in [PRD FR-08](../requirements/refined/customer-order-prd.md).

## Options Considered

| Option           | Summary                                                              | Trade-offs                                                                                 |
|------------------|----------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| Decimal numbers  | Store prices and totals as decimal numbers, for example 19.99.       | Binary floating-point cannot hold every decimal value exactly, so sums can drift.          |
| Integer cents    | Store each amount as a whole number of cents. Format at render time. | Sums are exact. Input and display code must convert between cents and text.                |

## Decision

Store all money as integer cents, for example in `unitPriceCents`. Format it only at render time, in the configured currency.

## Reason

Integer cents avoid float errors in totals ([AGENTS.md](../../AGENTS.md)). Quantities are whole numbers, so no rounding is needed ([GAP-03](../brds/customer-order-brd.md)).

## Consequences

* `unitPriceCents` is an integer in the data model ([PRD Data Model](../requirements/refined/customer-order-prd.md)).
* Order totals are the sum of `quantity * unitPriceCents` over the order lines ([PRD FR-08](../requirements/refined/customer-order-prd.md)).
* Domain tests check totals against cent values ([BRD BR-020](../brds/customer-order-brd.md)).

## Assumptions and Risks

* Assumption: no rounding is needed because quantities are whole numbers ([GAP-03](../brds/customer-order-brd.md)). Revisit this if fractional quantities are added.
* The currency is a separate choice: one configuration constant, USD by default ([GAP-03](../brds/customer-order-brd.md)).

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the BRD, PRD and AGENTS.md text. Builder review pending.
