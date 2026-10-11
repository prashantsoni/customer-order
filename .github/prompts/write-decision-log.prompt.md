---
description: "Write a dated decision log entry in docs/decisions/ with the options considered, the chosen option and the reason for the choice"
name: "Write Decision Log"
argument-hint: "Decision topic, options considered, chosen option and reason"
agent: "agent"
---

Write one decision record in `docs/decisions/` for the decision described in the request.

## Inputs

Required. If any of these are missing, ask for them once and stop:

* Decision topic
* Options considered (at least two)
* Chosen option and the reason for the choice

Optional: related requirement IDs (for example BR-019, FR-04, GAP-08), assumptions, consequences, and the AI tool or model used.

## Rules

* Use only what the request and the workspace documents state. Do not invent options, reasons or dates.
* Use today's date for `ms.date` and the record date, in ISO 8601 format (YYYY-MM-DD).
* Name the file `YYYY-MM-DD-<short-kebab-slug>.md`.
* Check `docs/decisions/` for an existing record on the same topic. Update that record instead of creating a duplicate, and ask if it is unclear which one applies.
* Link related IDs to `docs/requirements/refined/customer-order-prd.md` and `docs/brds/customer-order-brd.md`.
* Keep assumptions and accepted risks in their own section, separate from the decision.
* Write in plain, impersonal language. Do not use em dashes.
* Do not change code or other documents.

## Structure

Use this structure:

```markdown
---
title: <Decision title>
description: <One sentence on what was decided>
ms.date: <YYYY-MM-DD>
ms.topic: concept
keywords:
  - decision
  - <topic keyword>
---

## Status

<Accepted, unless the request says otherwise>

## Context

<Why the decision was needed, with requirement IDs>

## Options Considered

| Option     | Summary   | Trade-offs |
|------------|-----------|------------|
| <Option A> | <Summary> | <Trade-offs> |
| <Option B> | <Summary> | <Trade-offs> |

## Decision

<Chosen option, in one or two sentences>

## Reason

<Why this option was chosen over the others>

## Consequences

* <Effect on the code, data or users>

## Assumptions and Risks

* <Assumption or accepted risk, with its ID if one exists>

## AI Usage

* Tool or model: <name, or "not recorded">
* Role: <for example, drafted options or reviewed the output>
```

## Output

After writing the file, reply with the file path and a one-line summary of the decision. Do not repeat the record in chat.
