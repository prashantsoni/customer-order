---
title: Export and import out of scope
description: The release has no export or import of data, and the resulting data loss risk is accepted.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - scope
  - data loss
---

## Status

Accepted, with inferred reason. Builder to confirm.

## Context

Data lives in one browser's localStorage, which can be cleared and has a size limit ([GAP-07](../brds/customer-order-brd.md)). Export and import are listed as out of scope ([BRD Out of Scope](../brds/customer-order-brd.md)).

## Options Considered

| Option                           | Summary                                       | Trade-offs                                                         |
|----------------------------------|-----------------------------------------------|--------------------------------------------------------------------|
| Keep out of scope                | No export or import in this release.          | Smaller scope. Data loss risk is accepted.                         |
| Include export and import        | Users can download and load data files.       | Adds backup and move options. Adds scope and testing.              |

## Decision

Export and import are out of scope for this release.

## Reason

The raw requirement asks to keep the scope light ([raw requirement](../requirements/raw/raw-requirement.txt)). (Inferred link to the decision.)

## Consequences

* No backup or move path between browsers exists.
* Data is lost if the browser clears storage ([NFR-08](../requirements/refined/customer-order-prd.md)).

## Assumptions and Risks

* Accepted risk R-01: data loss when browser storage is cleared ([BRD R-01](../brds/customer-order-brd.md)).
* Recorded as accepted in this decision, as GAP-07 asks.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the workspace documents. Builder review pending.
