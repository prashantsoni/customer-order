---
title: Single user per browser with no login
description: The app serves one user per browser, with no login, user accounts or roles.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - authentication
  - scope
---

## Status

Accepted.

## Context

The business needs one place to record customers and orders, in a browser, with no server or account. Authentication, user accounts and roles are out of scope ([BRD scope](../brds/customer-order-brd.md), [GAP-01](../brds/customer-order-brd.md)). The PRD states the same model ([PRD Users](../requirements/refined/customer-order-prd.md)).

## Options Considered

| Option                  | Summary                                                        | Trade-offs                                                                                   |
|-------------------------|----------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| Single user, no login   | One user per browser. Data is read from the browser store.     | No access control. Anyone who can use the browser profile can see the data. Simple to build. |
| User accounts and roles | Users sign in and each user has a role.                        | Needs authentication, which the BRD places out of scope.                                      |

## Decision

The app supports one user per browser. There is no login, no user accounts and no roles.

## Reason

The business driver is a browser-only tool with no server or account ([BRD Business Drivers](../brds/customer-order-brd.md)). The raw requirement describes a local application ([raw requirement](../requirements/raw/raw-requirement.txt)).

## Consequences

* The code has no sign-in screen and no role checks.
* All customers and orders are kept in one browser store ([PRD FR-13](../requirements/refined/customer-order-prd.md)).
* Adding accounts later is a scope change.

## Assumptions and Risks

* A-01: One user per browser, on one device ([BRD A-01](../brds/customer-order-brd.md), A-03).
* Accepted risk: with no login, anyone who can use the browser profile can read the stored data. The data is also unencrypted ([GAP-08](../brds/customer-order-brd.md)).

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the BRD and PRD text. Builder review pending.
