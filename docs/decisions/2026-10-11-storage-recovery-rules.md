---
title: Storage recovery and write-lock rules
description: How the storage layer handles unreadable data, backup failure, read failure and save failure.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - storage
  - recovery
  - write lock
---

## Status

Accepted, with inferred rules. Builder to confirm.

## Context

D-17 sets the backup-and-reset rule for unreadable data. D-18 sets the save-failure rule. Neither record covers the cases where the backup itself fails, where the read fails, or how malformed data is classified ([PRD FR-14](../requirements/refined/customer-order-prd.md), [PRD FR-15](../requirements/refined/customer-order-prd.md)).

## Options Considered

| Option                                  | Summary                                                                 | Trade-offs                                                                  |
|-----------------------------------------|-------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| Lock writes when the backup fails       | Keep the raw value and refuse writes until the user frees storage.      | No data loss. The user cannot save until storage is freed. (Chosen.)        |
| Reset anyway after a failed backup      | Clear the main key even when the backup write failed.                   | Loses data silently. Rejected by D-17 intent. (Inferred option.)            |
| Treat malformed shape as a separate case | Report wrong-shape data differently from corrupt JSON.                 | More states for the UI to handle. Not needed for FR-14. (Inferred option.)  |

## Decision

* A backup is written before the main key is cleared. If the backup write fails, the raw value stays in place and all writes are locked. Writes return `BLOCKED_MESSAGE` until the app reloads with storage freed.
* Corrupt JSON, unknown `schemaVersion`, wrong shape and orphan references are all handled as unreadable. Each is backed up and the app starts empty.
* The read is eager. Recovery runs on the first `read()` and not on the first write.
* Referential checks (order to customer) run in the repositories and in the read path. An orphan order makes the whole document unreadable.
* A read failure (`getItem` throws) locks writes, so no save can overwrite data that was not read.
* The recovery notice is session-only. `dismissRecovery()` clears it. Nothing is persisted about the notice.
* A save failure (`setItem` throws) returns `STORAGE_ERROR_MESSAGE` and keeps the input. The store is not locked, so a retry is allowed.
* Backup keys use the `customer-order:corrupt-` prefix with the timestamp (`:` and `.` replaced by `-`). A collision appends `-n`.

## Reason

The app must not crash, must not lose data silently, and must tell the user when data is recovered ([BRD BR-014](../brds/customer-order-brd.md), [BRD BR-015](../brds/customer-order-brd.md)). (Inferred.) A write lock is the only safe choice when the backup cannot be made, because any write would discard the raw value.

## Consequences

* A backup failure is user-visible only through the blocked-save message. The UI must show it as a persistent alert in P3 ([PRD FR-15](../requirements/refined/customer-order-prd.md)).
* The recovery banner is `role="status"` and dismissible. It is wired to `status().recovered` in P3 ([PRD FR-14](../requirements/refined/customer-order-prd.md)).
* Tests in `tests/storage/store.test.js` cover each rule above.

## Assumptions and Risks

* Inferred: the write-lock rule for failed backups and read failures is not in the documents.
* Risk: a user who never frees storage cannot save until the page reloads. The message says to free storage and reload.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the implemented storage module and its tests. Builder review pending.
