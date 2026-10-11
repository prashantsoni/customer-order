---
title: Meet WCAG 2.2 AA for forms and messages
description: Forms, labels, focus and error messages meet WCAG 2.2 AA.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - accessibility
  - WCAG
---

## Status

Accepted, with inferred options and reason. Builder to confirm.

## Context

The accessibility target was not stated. It affects forms, labels and error messages ([GAP-10](../brds/customer-order-brd.md)).

## Options Considered

| Option           | Summary                                                  | Trade-offs                                                          |
|------------------|----------------------------------------------------------|---------------------------------------------------------------------|
| WCAG 2.2 AA      | Current WCAG version at level AA.                        | Current standard. Requires checks for the newest criteria.          |
| WCAG 2.1 AA      | Previous version at level AA. (Inferred option.)         | Familiar. Misses criteria added in 2.2.                             |
| No formal target | Best effort without a standard. (Inferred option.)       | No measurable check.                                                |

## Decision

Forms, labels, focus and error messages meet WCAG 2.2 AA.

## Reason

GAP-10 recommends this target. (Inferred for the choice of version over 2.1.)

## Consequences

* Text contrast is at least 4.5:1 in every theme ([PRD NFR-04](../requirements/refined/customer-order-prd.md)).
* Every action is reachable with the keyboard, and dialogs trap focus ([PRD FR-17](../requirements/refined/customer-order-prd.md)).

## Assumptions and Risks

* Inferred: the choice of WCAG 2.2 over 2.1 is not stated in the documents.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the workspace documents. Builder review pending.
