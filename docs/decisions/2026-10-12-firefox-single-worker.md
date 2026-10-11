---
title: Firefox runs alone with one worker
description: Firefox end-to-end tests run in a separate invocation with one worker after historical full parallel-run failures; current canonical verification passes.
ms.date: 2026-10-12
ms.topic: concept
keywords:
  - decision
  - testing
  - playwright
  - firefox
---

## Status

Accepted by the builder. The option list and reason are inferred; builder to confirm.

## Context

The full browser run uses Playwright's default parallel workers across four projects. The `desktop-firefox` project failed under that run in every full run recorded in [phase-6-review.md](../reviews/phase-6-review.md). The failures were navigation and teardown timeouts. The same Firefox tests pass when Firefox runs alone with one worker. Playwright sets the worker count for the whole run, not per project, so the config cannot cap Firefox alone ([Playwright decision](2026-10-11-playwright-browser-tests.md) for the test setup).

## Options Considered

| Option                                  | Summary                                                                                  | Trade-offs                                                                          |
|-----------------------------------------|------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| Cap all projects to one worker          | `--workers=1` for the whole `test:e2e` run.                                              | Slower for every project. Removes parallel coverage from the other projects.        |
| Split Firefox into its own run (chosen) | `test:e2e` runs the other three projects in parallel, then Firefox alone with `--workers=1`. | Two invocations. Both must pass, because they are joined with `&&`.                |
| Retry Firefox failures                  | Raise `retries` for Firefox.                                                             | Hides the timeouts instead of isolating them. Rejected. (Inferred option.)          |
| Accept the parallel failures            | Leave the run red and record it.                                                         | The full run would never pass. Rejected.                                            |

## Decision

In `package.json`, `test:e2e` runs `desktop-chromium`, `desktop-webkit`, and `phone-360` in parallel, then runs `desktop-firefox` with `--workers=1`. The change is in the `test:e2e` script, not in `playwright.config.js`.

## Reason

Historical full parallel runs failed in Firefox, while the split run passed. P7 verification on 2026-10-12 passed the canonical split run (111 tests in the first invocation and 37 Firefox tests with one worker). Standalone Firefox also passed 37 tests with default workers and 74 tests over two repetitions. The cause of the historical cross-project parallel failures remains unknown; retain the split as a conservative, passing gate.

## Consequences

* `npm run test:e2e` runs two Playwright invocations. The exit code is non-zero if either fails.
* Firefox coverage is kept. It runs one worker at a time.
* The parallel Firefox failures are not fixed. They are isolated.
* The standalone default-worker Firefox run currently passes; the serial canonical stage remains in place until the historical cross-project failure is understood or the decision is revisited.

## Assumptions and Risks

* Inferred: the failures come from running several Firefox instances at once in this environment. Not confirmed.
* Risk: a one-worker run can hide a defect that only appears under parallel load.
* Risk: the split is a workaround. If the parallel cause is found, this record should be revisited.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: changed the `test:e2e` script and drafted this record from the builder's answers. Builder review pending.
