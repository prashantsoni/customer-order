---
title: English only, with dates shown in the user's locale
description: UI text is in English. Dates display in the user's locale, while storage stays ISO 8601.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - localization
  - dates
---

## Status

Accepted, with inferred options. Builder to confirm.

## Context

Language and locale were not defined ([GAP-15](../brds/customer-order-brd.md)). Multiple languages are out of scope ([PRD Non-Goals](../requirements/refined/customer-order-prd.md)).

## Options Considered

| Option                 | Summary                                                | Trade-offs                                                          |
|------------------------|--------------------------------------------------------|---------------------------------------------------------------------|
| English only          | All UI text in English. Dates in the user's locale.    | Simple copy. Other languages need new work later.                   |
| Multiple languages    | Translated UI text. (Inferred option.)                 | Out of scope. Adds translation and testing.                         |

## Decision

UI text is English only. Dates display in the user's locale.

## Reason

Multiple languages are out of scope ([PRD Non-Goals](../requirements/refined/customer-order-prd.md)). Locale date display is the GAP-15 recommendation ([GAP-15](../brds/customer-order-brd.md)).

## Consequences

* Dates are formatted at render time. Storage keeps ISO 8601 ([D-30](2026-10-11-iso-8601-dates.md)).

## Assumptions and Risks

* No accepted risks are recorded for this decision.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the workspace documents. Builder review pending.
