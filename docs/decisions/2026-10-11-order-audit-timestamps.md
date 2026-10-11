---
title: Store createdAt and updatedAt without an audit log
description: Customers and orders record their creation and last update times, with no full change history.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - audit
  - data model
---

## Status

Accepted.

## Context

Only `createdAt` was stored. That limits history and support ([GAP-16](../brds/customer-order-brd.md)). A full audit log is out of scope ([PRD Non-Goals](../requirements/refined/customer-order-prd.md)).

## Options Considered

| Option                    | Summary                                                       | Trade-offs                                                              |
|---------------------------|---------------------------------------------------------------|-------------------------------------------------------------------------|
| createdAt only            | Keep the single creation timestamp.                           | Simplest. No record of when a value last changed.                       |
| createdAt and updatedAt   | Set an update time on every save of a customer or order.      | Shows the last change. Earlier changes are not kept.                    |
| Full audit log            | Record every change with its time.                            | Most complete. Out of scope ([GAP-16](../brds/customer-order-brd.md)).  |

## Decision

Customers and orders store `createdAt` and `updatedAt` as ISO 8601 strings. No audit log is kept.

## Reason

`updatedAt` adds the last-change time, which addresses the history and support gap ([GAP-16](../brds/customer-order-brd.md)). A full audit log is out of scope.

## Consequences

* Saving a customer or order sets `updatedAt` ([PRD FR-01](../requirements/refined/customer-order-prd.md), FR-03, FR-06).
* The data model includes `updatedAt` for customers and orders ([PRD Data Model](../requirements/refined/customer-order-prd.md)).

## Assumptions and Risks

* Accepted risk: earlier changes cannot be reconstructed, because no audit log is kept ([GAP-16](../brds/customer-order-brd.md)).

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the BRD and PRD text. Builder review pending.
