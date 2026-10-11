---
title: Test Suite
description: Test layout and commands for the customer-order application.
---

## Layout

* `domain/`: unit tests for pure business rules
* `storage/`: repository and persistence tests using fake storage
* `utils/`: tests for shared utilities
* `e2e/`: browser workflows, accessibility checks, and volume checks
* `helpers/`: shared builders, fake storage, and test data

## Run Tests

Run unit and storage tests with Node's built-in test runner:

```sh
npm test
```

Run the Playwright browser suite with:

```sh
npm run test:e2e
```

The browser command runs Chromium, WebKit, and the phone-sized project first, then Firefox with one worker. Unit tests do not require a browser; browser tests require the Playwright browsers to be installed.
