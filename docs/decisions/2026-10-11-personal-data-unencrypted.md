---
title: Personal data stored unencrypted in the browser
description: Contact details are stored unencrypted, and the stored fields are limited to contact details and order data.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - privacy
  - data protection
---

## Status

Accepted, with inferred reason. Builder to confirm.

## Context

Names, emails and phone numbers are personal data ([GAP-08](../brds/customer-order-brd.md)). The data is stored unencrypted in the browser ([PRD NFR-06](../requirements/refined/customer-order-prd.md)).

## Options Considered

| Option                      | Summary                                              | Trade-offs                                                                |
|-----------------------------|------------------------------------------------------|---------------------------------------------------------------------------|
| Store unencrypted, limit fields | Keep the data as plain text. Store contact fields only. | No key management. Data is readable by anyone with access to the browser profile. |
| Encrypt stored data         | Encrypt the data before saving.                      | Adds a key that must also be kept in the browser. (Inferred option.)      |

## Decision

Store the data unencrypted. Limit stored fields to contact details and order data. Record that the data is local and unencrypted.

## Reason

The app has no server or login, so there is no secure place to hold a key. Limiting fields reduces exposure ([GAP-08](../brds/customer-order-brd.md)). (Inferred.)

## Consequences

* The data model lists only the fields in the [PRD Data Model](../requirements/refined/customer-order-prd.md).

## Assumptions and Risks

* Accepted risk R-04: unencrypted personal data in browser storage ([BRD R-04](../brds/customer-order-brd.md)).

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the workspace documents. Builder review pending.
