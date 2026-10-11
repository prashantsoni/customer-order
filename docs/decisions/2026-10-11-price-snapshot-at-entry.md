---
title: Capture the unit price on each order line at entry
description: Each order line keeps the unit price captured when the line was entered, so later price changes do not alter past orders.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - order lines
  - pricing
---

## Status

Accepted.

## Context

Order lines hold a description and a price. A later price change could alter past orders ([GAP-14](../brds/customer-order-brd.md)). No product catalogue is in scope ([BRD Out of Scope](../brds/customer-order-brd.md)). The rule is in [PRD FR-07](../requirements/refined/customer-order-prd.md) and assumption A-09.

## Options Considered

| Option             | Summary                                                                 | Trade-offs                                                                                              |
|--------------------|-------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| Snapshot at entry  | Store the unit price on the line when the line is entered.              | Past orders stay the same when prices change. A wrong price stays until the line is corrected in Draft. |
| Live price lookup  | Read the current price from a product catalogue when the order is shown. | Past orders would change with price updates. Needs a catalogue, which is out of scope.                  |

## Decision

Each order line stores `unitPriceCents` as captured when the line is entered. Later price changes do not change existing lines.

## Reason

A later price change could alter past orders. A snapshot keeps each line's price fixed ([GAP-14](../brds/customer-order-brd.md)).

## Consequences

* The user enters the price on each line. There is no catalogue lookup.
* Lines can be changed only while the order is in Draft ([PRD FR-09](../requirements/refined/customer-order-prd.md)). A wrong price can be corrected only in Draft.

## Assumptions and Risks

* A-09: Lines keep the price captured at entry ([PRD A-09](../requirements/refined/customer-order-prd.md)).
* Accepted risk: a mistyped price on a Confirmed order stays, because Confirmed orders are read-only ([PRD FR-09](../requirements/refined/customer-order-prd.md)).

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the BRD and PRD text. Builder review pending.
