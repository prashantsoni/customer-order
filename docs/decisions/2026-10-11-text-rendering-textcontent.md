---
title: Render user text with textContent
description: User-provided and stored text is rendered as plain text, never as HTML.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - security
  - rendering
---

## Status

Accepted.

## Context

Customer names, emails, phone numbers and line descriptions are user text. All user text must render as plain text ([PRD NFR-03](../requirements/refined/customer-order-prd.md)). The project rule is set in [AGENTS.md](../../AGENTS.md).

## Options Considered

| Option                           | Summary                                                                 | Trade-offs                                                                                       |
|----------------------------------|-------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| innerHTML with string templates  | Build markup as strings and assign them to `innerHTML`.                 | Short to write. User text can be read as markup, which allows script injection.                   |
| textContent or DOM node APIs     | Assign user text with `textContent`, or build elements with `createElement`. | User text always shows as text. Building markup takes more code.                            |

## Decision

Render user-provided and stored text with `textContent` or DOM node APIs. Do not assign user text to `innerHTML`.

## Reason

User text must render as plain text ([PRD NFR-03](../requirements/refined/customer-order-prd.md)). Escaping at render time stops entered or stored values from being run as markup.

## Consequences

* Views and components create elements with DOM calls.
* The UI rules in `ui.instructions.md` apply ([PRD NFR-03](../requirements/refined/customer-order-prd.md)).

## Assumptions and Risks

* Assumption: stored text is treated as untrusted, as NFR-03 requires for stored data.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the AGENTS.md and PRD text. Builder review pending.
