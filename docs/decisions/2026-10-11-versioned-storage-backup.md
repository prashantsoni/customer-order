---
title: Versioned storage with backup of unreadable data
description: Stored data carries a schemaVersion, and unreadable data is backed up under a separate key before the app resets.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - storage
  - schemaVersion
  - recovery
---

## Status

Accepted, with inferred options. Builder to confirm.

## Context

The app must not crash on corrupt or missing data, and must warn the user ([BRD BR-014](../brds/customer-order-brd.md), [PRD FR-14](../requirements/refined/customer-order-prd.md)).

## Options Considered

| Option                                 | Summary                                                                 | Trade-offs                                                         |
|----------------------------------------|-------------------------------------------------------------------------|--------------------------------------------------------------------|
| Versioned document with backup         | Store `schemaVersion`. Copy unreadable data to a separate key before reset. | Keeps the data for recovery. Needs a backup key and a banner.   |
| Silent reset                           | Discard unreadable data and start empty.                                | No warning and no recovery. (Inferred option.)                     |

## Decision

Store a `schemaVersion` in the document. When data is corrupt or unsupported, copy it to a separate backup key, reset the app, and show a dismissible banner.

## Reason

The app must recover without crashing and must not lose data silently ([BRD BR-014](../brds/customer-order-brd.md), [BR-015](../brds/customer-order-brd.md)). (Inferred.)

## Consequences

* A backup key is written before reset. The key name is not yet fixed in the docs.
* The banner uses `role="status"` ([PRD FR-14](../requirements/refined/customer-order-prd.md)).
* Missing data starts empty with no warning ([PRD FR-14](../requirements/refined/customer-order-prd.md)).

## Assumptions and Risks

* Inferred: the silent-reset option and its risk are not in the documents.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the workspace documents. Builder review pending.
