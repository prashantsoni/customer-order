---
title: Show a persistent error and keep entered values on save failure
description: A failed save shows a persistent alert and keeps the entered values in the form.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - storage
  - errors
---

## Status

Accepted, with inferred option. Builder to confirm.

## Context

A quota or write error must not lose a change silently ([BRD BR-015](../brds/customer-order-brd.md), [PRD FR-15](../requirements/refined/customer-order-prd.md)).

## Options Considered

| Option                              | Summary                                                       | Trade-offs                                                                 |
|-------------------------------------|---------------------------------------------------------------|----------------------------------------------------------------------------|
| Persistent alert and kept input     | Show a `role="alert"` banner with a retry hint. Keep the form values. | The user sees the failure and can retry. The banner stays until resolved.  |
| Transient message                   | Show a short message that disappears.                         | The user may miss it and lose input. (Inferred option.)                    |

## Decision

On a save failure, show a persistent alert with a retry hint. Keep the entered values in the form.

## Reason

No change may be lost silently, and entered values must stay ([BRD BR-015](../brds/customer-order-brd.md)).

## Consequences

* A failed save does not remove data from the form ([PRD FR-15](../requirements/refined/customer-order-prd.md)).
* A failed delete removes nothing ([PRD FR-04](../requirements/refined/customer-order-prd.md)).

## Assumptions and Risks

* Inferred: the transient-message option is not in the documents.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the workspace documents. Builder review pending.
