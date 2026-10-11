---
title: Validation limits for customers and order lines
description: Name, email, phone, quantity and unit price follow fixed limits, as recommended in GAP-05.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - validation
  - customers
  - order lines
---

## Status

Accepted, with inferred reason. Builder to confirm.

## Context

Validation rules were incomplete in the BRD ([GAP-05](../brds/customer-order-brd.md)). The PRD applies them to customers and order lines ([PRD FR-01](../requirements/refined/customer-order-prd.md), FR-03, FR-07).

## Options Considered

| Option               | Summary                                                                  | Trade-offs                                                                |
|----------------------|--------------------------------------------------------------------------|---------------------------------------------------------------------------|
| Fixed limits (GAP-05) | Name 1 to 100 characters. Email basic format, unique ignoring case. Phone up to 30 characters. Quantity 1 to 9999. Unit price 0 to 100,000.00. | Clear rules that bound input. Limits need to be revisited if needs change. |
| No fixed limits      | Accept any length or value that the storage can hold.                    | Unbounded input and weaker validation. (Inferred option.)                 |

## Decision

Apply the GAP-05 limits: name 1 to 100 characters. Email is optional, in basic format, and unique ignoring case. Phone is optional, up to 30 characters. Quantity is a whole number from 1 to 9999. Unit price is zero or more, up to 100,000.00.

Two rules are not in GAP-05 and are inferred (P1, to confirm):

* Email is at most 254 characters (RFC 5321 address limit).
* Phone uses only digits, spaces, and `+ - ( ) .`.

## Reason

Fixed limits stop unbounded input and keep the data within the storage limit ([NFR-07](../requirements/refined/customer-order-prd.md)). (Inferred.)

## Consequences

* Each rule shows an inline error next to its field ([PRD FR-16](../requirements/refined/customer-order-prd.md)).
* Validation is covered by domain tests ([BRD BR-020](../brds/customer-order-brd.md)).

## Assumptions and Risks

* GAP-05 gives these values as recommendations. They are not confirmed by a stakeholder.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the workspace documents. Builder review pending.
