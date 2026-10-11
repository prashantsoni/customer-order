---
title: Assume 500 customers and 5,000 orders
description: The app is designed for up to 500 customers and 5,000 orders, with results shown within 300 ms at that size.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - performance
  - volume
---

## Status

Accepted by the builder as the design volume: 500 customers and 5,000 orders.

## Context

Data volume and performance were not stated ([GAP-11](../brds/customer-order-brd.md)). The volume affects storage design and the search approach ([PRD NFR-01](../requirements/refined/customer-order-prd.md)).

## Options Considered

| Option                       | Summary                                                     | Trade-offs                                                              |
|------------------------------|-------------------------------------------------------------|-------------------------------------------------------------------------|
| 500 customers, 5,000 orders  | Design and test at this volume.                             | Matches the GAP-11 assumption. Must be confirmed.                       |
| Larger volume                | Design for more data. (Inferred option.)                    | More storage and search work, with no stated need.                      |

## Decision

Design for up to 500 customers and 5,000 orders, with search results within 300 ms at that size.

## Reason

GAP-11 gives this assumption as the basis for the design ([GAP-11](../brds/customer-order-brd.md)).

## Consequences

* Storage use must stay well within the localStorage limit ([PRD NFR-07](../requirements/refined/customer-order-prd.md)).
* Search and filter are tested at this volume ([PRD NFR-01](../requirements/refined/customer-order-prd.md)).
* Measured in P6 with generated sample data at 500 customers and 5,000 orders (see [P6 review](../reviews/phase-6-review.md)):
  * Serialized document: 1,777,055 bytes (ASCII only), against a 5,242,880-byte (5 MiB) test limit, about 34%.
  * `searchCustomers` at 500 customers: 0.131 ms (empty query), 0.956 ms ("hopper"), 0.391 ms (no match). Limit 300 ms.
  * `filterOrders` at 5,000 orders: 1.352 ms (All), 1.411 ms (Draft), 4.076 ms (customer name "hopper"), 1.270 ms (Cancelled plus "hopper"). Limit 300 ms.
  * Browser (Chromium, desktop and 360-wide phone): search input handler render time 1.5 ms and 1.8 ms with 500 customers.
  * The sample is not a worst case. Line count per order is not capped by the schema, so storage grows with lines.

## Assumptions and Risks

* Accepted by the builder. GAP-11 in the BRD still lists the volume as an open question.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the workspace documents. Builder review pending.
