---
title: One configured currency, USD by default
description: All amounts use one currency, set in a single configuration constant that defaults to USD.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - currency
  - money
---

## Status

Accepted, with inferred reason. Builder to confirm.

## Context

Money is shown in one currency ([GAP-03](../brds/customer-order-brd.md)). Multiple currencies are a non-goal ([PRD Non-Goals](../requirements/refined/customer-order-prd.md)).

## Options Considered

| Option                       | Summary                                                  | Trade-offs                                                       |
|------------------------------|----------------------------------------------------------|------------------------------------------------------------------|
| One configured currency      | One constant sets the currency. Default is USD.          | Simple totals and display. Changing currency is a code change.   |
| Several currencies per order | Each order or line carries its own currency.             | Needs conversion and per-currency totals. Out of scope.          |

## Decision

Use one currency, set in one configuration constant. The default is USD.

## Reason

Multiple currencies are out of scope. One constant keeps totals and display simple. (Inferred.)

## Consequences

* Amounts are formatted with the configured currency at render time ([PRD FR-08](../requirements/refined/customer-order-prd.md)).

## Assumptions and Risks

* Inferred: the simplicity reason is not stated in the documents.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the workspace documents. Builder review pending.
