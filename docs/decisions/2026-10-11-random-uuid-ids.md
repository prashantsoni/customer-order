---
title: Generate IDs with crypto.randomUUID()
description: Customers, orders and order lines receive their IDs from crypto.randomUUID().
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - data model
  - identifiers
---

## Status

Accepted, with inferred options and reason. Builder to confirm.

## Context

Every customer, order and line needs an ID ([AGENTS.md](../../AGENTS.md) Conventions). IDs are part of the data model ([PRD Data Model](../requirements/refined/customer-order-prd.md)).

## Options Considered

| Option                         | Summary                                                  | Trade-offs                                                              |
|--------------------------------|----------------------------------------------------------|-------------------------------------------------------------------------|
| `crypto.randomUUID()`          | Random UUID from the browser crypto API.                 | No read of stored data needed. Needs a browser that supports it.        |
| Sequential counter             | Increment a counter stored with the data. (Inferred option.) | Readable IDs. Counter must be kept in step with the data.           |

## Decision

Generate every ID with `crypto.randomUUID()`.

## Reason

An ID can be created without reading stored data, and it stays unique after deletes. (Inferred.)

## Consequences

* The browsers in [D-25](2026-10-11-browser-support.md) all support the API. Confirm this for each.

## Assumptions and Risks

* Inferred: the reason is not stated in the documents.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the workspace documents. Builder review pending.
