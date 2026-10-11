---
title: Build choices for P5 responsive and accessibility hardening
description: Tab wrap in the confirm dialog, unique dialog ids, focus return from the line form, named scroll region, control border token, dark palette and reduced-motion guard.
ms.date: 2026-10-12
ms.topic: concept
keywords:
  - decision
  - accessibility
  - responsive
  - contrast
  - dark-mode
---

## Status

Accepted, with inferred rationale. Builder to confirm.

## Context

Phase P5 hardens the UI for FR-17 (responsive layout and keyboard use), NFR-04 (WCAG 2.2 AA target) and NFR-05 (phone width 360 px). The e2e spec `tests/e2e/accessibility.spec.js` was written first and failed in six checks: Tab left the confirm dialog, the order detail page had four dialogs sharing one id, and Cancel on the line form left focus on `body`. The documents set the targets ([D-25](2026-10-11-browser-support.md), [D-26](2026-10-11-accessibility-wcag-22-aa.md)) but not the build choices.

## Options Considered

| Topic | Chosen | Alternative | Trade-offs |
|-------|--------|-------------|------------|
| Focus in confirm dialog | Keydown handler wraps Tab and Shift+Tab between the first and last focusable items | Rely on native `showModal()` | Chromium did not wrap Tab in the e2e run (`Expected: true, Received: false`). The handler is covered by the accessibility spec. |
| Dialog message id | Counter per dialog (`confirm-message-N`) | One fixed id | Order detail renders four dialogs, so a fixed id gave duplicate ids. The counter keeps `aria-describedby` correct. |
| Focus after line form Cancel | Return focus to the element that opened the form | Leave focus on `body` | Keyboard and screen reader users keep their place. Cost: one variable in `openLineForm`. |
| Scroll wrapper for wide tables | `role="region"` and `aria-label` set to the table caption, keep `tabindex="0"` | Remove `tabindex` | A focusable scroll area needs a name. Removing `tabindex` would stop keyboard scrolling. |
| Control border | New token `--color-control-border` (`#767676` light, `#8e8ea0` dark) for inputs and secondary buttons | Keep `--color-border` | The old border (`#c4c4cc`) is 1.73:1 on white, below the 3:1 non-text target. Dividers keep the light border. |
| Colour scheme | Dark palette under `prefers-color-scheme: dark`, with `color-scheme` set in both modes | Light only with `color-scheme: light` | A dark palette follows the user's system setting. It needs contrast checks for each pair, recorded in the review. |
| Reduced motion | Global guard for animation and transition duration | No guard | The app has no animation today. The guard keeps future motion within the user's setting at no cost. |
| Wide screens | `main` max width 60rem at 960 px and up | Keep 48rem | Keeps lines short on desktop without changing the 360 px layout. |
| Viewport zoom | Keep `index.html` viewport without `user-scalable=no` | Restrict zoom | Zoom stays available for low-vision users (WCAG 1.4.4). |

## Decision

Wrap Tab inside the confirm dialog. Give each dialog its own message id. Return focus to the opener when the line form is cancelled. Name the scroll region after the table caption. Add a control border token. Add a dark palette under `prefers-color-scheme: dark`. Add a reduced-motion guard. Use a 60rem main width from 960 px.

## Reason

These choices fix the six failing checks with the smallest change, keep all colours in custom properties, and keep the rules in the UI and CSS layers. Contrast ratios were computed by script for each token pair and are recorded in [phase-5-review.md](../reviews/phase-5-review.md). All text pairs checked are at least 4.5:1 (lowest 5.75:1) and the control border is at least 3:1 on its surface (lowest 4.54:1) ([D-26](2026-10-11-accessibility-wcag-22-aa.md), [D-21](2026-10-11-vanilla-js-no-build-step.md)).

## Consequences

* The confirm dialog keeps focus inside while open. Escape still closes it and returns focus to the opener.
* Each dialog's description is unique on the page. The page has no duplicate ids (e2e test "has no duplicate ids on the order detail page").
* A user on the dark setting sees a dark palette. No manual screenshot review was done; the review says so.
* `aria-label` remains on dialogs ([D-32](2026-10-12-p3-ui-approach.md)). The optional switch to `aria-labelledby` is deferred.

## Assumptions and Risks

* Inferred: the dark palette is an addition to the P5 scope. The builder confirms it or asks for light only.
* Risk: contrast was computed from token values, not measured on rendered pixels. Forced-colours mode and Windows High Contrast were not tested.
* Risk: the Tab wrap lives in the confirm dialog component. Any new dialog must use that component or repeat the wrap.

## AI Usage

* Tool or model: GitHub Copilot, Claude Haiku 5.5
* Role: drafted the record from the P5 spec results, the code changes and the computed contrast ratios. Builder review pending.
