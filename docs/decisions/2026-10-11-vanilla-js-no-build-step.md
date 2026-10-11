---
title: Vanilla JavaScript with no framework or build step
description: The app uses ES modules with plain HTML and CSS, and has no framework, bundler or runtime dependency.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - architecture
  - tech stack
---

## Status

Accepted, with inferred options and reason. Builder to confirm.

## Context

The app must run locally with no build step and no runtime dependency ([BRD BR-018](../brds/customer-order-brd.md)). The tech choice is in the [README](../../README.md) and assumption A-04 ([PRD A-04](../requirements/refined/customer-order-prd.md)).

## Options Considered

| Option                       | Summary                                                    | Trade-offs                                                              |
|------------------------------|------------------------------------------------------------|-------------------------------------------------------------------------|
| Vanilla JavaScript           | ES modules, HTML and CSS. No bundler or runtime dependency. | Runs from `npm start` with no build. More manual DOM code.              |
| Framework with build tooling | A UI framework and a bundler. (Inferred option.)           | Faster UI work. Adds a build step and dependencies, which BR-018 rules out. |

## Decision

Use vanilla JavaScript with ES modules, HTML and CSS. Add no framework, bundler or runtime dependency without asking.

## Reason

The scope is light ([raw requirement](../requirements/raw/raw-requirement.txt)). BR-018 requires no build step and no runtime dependency. (Inferred link.)

## Consequences

* `npm start` serves `src/` ([PRD FR-18](../requirements/refined/customer-order-prd.md)).
* `package.json` lists no runtime dependencies.

## Assumptions and Risks

* A-04: vanilla JavaScript with no framework ([BRD A-04](../brds/customer-order-brd.md)).

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the workspace documents. Builder review pending.
