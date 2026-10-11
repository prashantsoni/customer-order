---
title: Support current Chrome, Edge, Firefox and Safari
description: The app supports the current versions of four browsers on desktop and tablet, and phones down to 360 px.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - browser support
  - responsive
---

## Status

Accepted by the builder: 360 px minimum. The browser list and reason are inferred; builder to confirm.

## Context

Browser and device support was not stated ([GAP-09](../brds/customer-order-brd.md)). It affects the responsive requirement and testing effort ([BRD BR-017](../brds/customer-order-brd.md)).

## Options Considered

| Option                              | Summary                                                       | Trade-offs                                                       |
|-------------------------------------|---------------------------------------------------------------|------------------------------------------------------------------|
| Current Chrome, Edge, Firefox, Safari | Current versions on desktop and tablet. Phones down to 360 px. | Covers most browsers in use. Testing covers four engines.        |
| Chrome only                         | Current Chrome on desktop. (Inferred option.)                 | Less testing. Excludes other users.                              |

## Decision

Support the current versions of Chrome, Edge, Firefox and Safari, on desktop and tablet, with phones down to 360 px.

## Reason

The four browsers cover the desktop and tablet use in the BRD ([GAP-09](../brds/customer-order-brd.md)). (Inferred.)

## Consequences

* Layout must work from 360 px ([PRD FR-17](../requirements/refined/customer-order-prd.md)).
* [PRD NFR-05](../requirements/refined/customer-order-prd.md) is updated to 360 px to match this decision and FR-17.

## Assumptions and Risks

* Inferred: the coverage reason is not stated in the documents.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the workspace documents. Builder review pending.
