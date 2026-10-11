---
title: Use the Node built-in test runner
description: Domain and storage tests run with node --test, with no third-party test dependency.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - testing
  - node
---

## Status

Accepted, with inferred options and reason. Builder to confirm.

## Context

Domain and storage logic needs automated tests ([BRD BR-020](../brds/customer-order-brd.md)). The test command is `npm test` ([README Getting Started](../../README.md)).

## Options Considered

| Option                       | Summary                                              | Trade-offs                                                              |
|------------------------------|------------------------------------------------------|-------------------------------------------------------------------------|
| Node built-in `node --test`  | Test runner included in Node.                        | No test dependency. Fewer built-in matchers and helpers.                |
| Third-party test framework   | A separate test library. (Inferred option.)          | Richer matchers. Adds a dev dependency, which BR-018 avoids for runtime. |

## Decision

Run domain and storage tests with `node --test`.

## Reason

Node 20 includes the runner, so no test dependency is needed. (Inferred.)

## Consequences

* `npm test` runs `node --test` ([AGENTS.md](../../AGENTS.md)). Node 24 rejects a directory argument, so the command takes no path.
* Tests need no browser ([AGENTS.md](../../AGENTS.md)).

## Assumptions and Risks

* Inferred: the reason is drawn from the README prerequisite, not a stated rationale.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the workspace documents. Builder review pending.
