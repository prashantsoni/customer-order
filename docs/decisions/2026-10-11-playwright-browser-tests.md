---
title: Playwright for browser end-to-end tests
description: Browser tests use Playwright as a dev-only dependency, run separately from the unit tests, and cover the 360px layout and keyboard access.
ms.date: 2026-10-11
ms.topic: concept
keywords:
  - decision
  - testing
  - playwright
---

## Status

Accepted by the builder. The tool choice is the builder's. The option list and reason are inferred; builder to confirm.

## Context

The unit tests use `node:test` with no browser ([decision](2026-10-11-node-test-runner.md)). The app must work at 360px and with keyboard only ([PRD FR-17 and NFR-05](../requirements/refined/customer-order-prd.md), [accessibility decision](2026-10-11-accessibility-wcag-22-aa.md)). Unit tests cannot check either. [AGENTS.md](../../AGENTS.md) requires asking before adding a dependency; the builder asked for Playwright to be installed.

## Options Considered

| Option                    | Summary                                                                 | Trade-offs                                                                 |
|---------------------------|-------------------------------------------------------------------------|----------------------------------------------------------------------------|
| Playwright                | `@playwright/test` drives Chromium and emulates a 360px phone viewport. | One dev dependency and a browser download. Runs outside `npm test`.        |
| Cypress                   | A browser test runner with its own interactive UI. (Inferred option.)   | Larger install and a second runner to maintain.                            |
| No automated browser test | Manual checks only.                                                     | Regressions in the 360px layout and keyboard flows go unnoticed.           |

## Decision

Use Playwright for browser end-to-end tests. Add `@playwright/test` as a dev dependency only. Keep unit tests on `node:test` and run them with `npm test`, with no browser.

## Reason

The builder chose Playwright. It runs the app in a real browser at 360px and checks keyboard access, which the unit tests cannot cover. (Inferred reason for the alternatives.)

## Consequences

* `package.json` lists `@playwright/test` under `devDependencies` and still has no runtime dependency.
* `npm test` runs unit tests only. `npm run test:e2e` runs `playwright test`.
* `playwright.config.js` starts `npm start` on port 5173 and runs two projects: desktop Chromium and a 360px phone viewport.
* Browser binaries are downloaded with `npx playwright install chromium`. They are not stored in the repository.
* Specs go in `tests/e2e/`. The folder has no specs yet because `src/index.html` is not built.
* [Test guidelines](../../.github/instructions/tests.instructions.md) forbid other test frameworks in `tests/`. This record is the exception for `tests/e2e/` only.

## Assumptions and Risks

* Inferred: Chromium is enough for the first browser suite. Firefox and WebKit are not configured.
* Risk: the first run needs a browser download, so e2e tests cannot run offline on a new machine.
* Risk: `npm run test:e2e` reports no tests until specs are added to `tests/e2e/`.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record and the Playwright config from the builder's instructions. Builder review pending.
