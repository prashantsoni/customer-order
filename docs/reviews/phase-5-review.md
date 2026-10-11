# Phase 5 Review: Responsive and Accessibility Hardening

Model(s) used: Claude Haiku 5.5 | Date: 2026-10-12

## Scope

Phase P5 covers FR-17, NFR-04 and NFR-05. Files changed: `src/js/ui/components/confirm-dialog.js`, `src/js/ui/views/order-detail.js`, `src/js/ui/components/table.js`, `src/css/main.css`. New spec: `tests/e2e/accessibility.spec.js` (7 tests, each run in `desktop-chromium` and `phone-360`). Domain and storage code were not changed. The decision for these changes is [D-34](../decisions/2026-10-12-p5-responsive-a11y.md).

## Gate

| Check | Result |
|-------|--------|
| `npm test` (bare `node --test`) | 122 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo. Counted from raw output. No unit tests were added in P5. |
| `npm run check` | "check passed: 33 file(s) in src/". |
| `npm run test:e2e` | 68 passed, 0 failed (54 earlier tests plus 14 new accessibility checks, 7 × 2 projects). Duration 50.8s. |
| `tests/e2e/accessibility.spec.js` (first run, before fixes) | 6 failed, 8 passed. |
| `tests/e2e/accessibility.spec.js` (after fixes) | 14 passed. |

The first run was the failing-first step. The six failures were: Tab leaving the confirm dialog (desktop and phone), duplicate `confirm-message` ids on order detail (desktop and phone), and focus left on `body` after Cancel on the line form (desktop and phone).

## Findings fixed

* Tab left the confirm dialog. Chromium does not wrap Tab inside a modal `<dialog>`. Fixed with a keydown handler in `confirm-dialog.js` that wraps Tab and Shift+Tab between the first and last focusable items.
* Duplicate ids: four dialogs on order detail shared `confirm-message`. Fixed with a counter, so each dialog has a unique message id.
* Focus after Cancel on the line form stayed on `body`. Fixed by returning focus to the element that opened the form.
* The focusable table scroll wrapper had no accessible name. Fixed with `role="region"` and `aria-label` set to the table caption.
* Control edges: inputs and secondary buttons use the `--color-control-border` token (`#767676` light, `#8e8ea0` dark), which gives 4.54:1 on white and 5.08:1 on the dark surface. Colour values appear only inside the token definitions.
* Dark setting: added under `prefers-color-scheme: dark`. It sets `color-scheme: dark` and the dark token values. Dialog background and text are set on `dialog.confirm-dialog`.
* Wide screens: added `main` max width 60rem at 960 px.
* Reduced motion: added a global guard. The app has no animation today, so this guard changes nothing now.

## Already met (verified, no change)

* Escape closes the confirm dialog and focus returns to the opener (e2e test passes).
* No horizontal page scroll at 360, 768 and 1280 px on every route (e2e test passes).
* Buttons, inputs, selects and links have a minimum height of 44px. Form fonts are 1rem (16px). Both were already in place in `main.css`.
* Visible focus ring (`:focus-visible`) and inline `aria-invalid` and `aria-describedby` from P3 and P4.

## Findings deferred

* Dialogs keep `aria-label`. An optional switch to `aria-labelledby` is recorded in [D-32](../decisions/2026-10-12-p3-ui-approach.md) and deferred.
* Width 320 px was added to the responsive e2e matrix in P7; P5's original target widths remain 360, 768 and 1280 px.
* Visual review of the dark palette and of forced-colours mode was not done.
* `scripts/check.js` false positive: `\.on[a-z]+\s*=` matches `.one =`. Carried from P2.
* Unit count reconciliation (122 here, 112 in P3) is for P7.
* Phase-3 review line 41 is historical and unchanged.
* P6 was approved by the user on 2026-10-12 and starts after this gate.

## Contrast ratios (computed from token values)

Computed with the WCAG relative luminance formula in a short Node script. No dependency added. Values are the ratios printed by the script.

| Pair | Foreground | Background | Ratio | Requirement | Result |
|------|------------|------------|-------|-------------|--------|
| Light text on page | `#1b1b1f` | `#ffffff` | 17.17 | 4.5 | Pass |
| Light text on success banner | `#1b1b1f` | `#e8f5e9` | 15.26 | 4.5 | Pass |
| Light text on error banner | `#1b1b1f` | `#fdecea` | 15.01 | 4.5 | Pass |
| Light muted text | `#55555f` | `#ffffff` | 7.37 | 4.5 | Pass |
| Light accent link | `#1d4ed8` | `#ffffff` | 6.70 | 4.5 | Pass |
| Light danger text | `#b42318` | `#ffffff` | 6.57 | 4.5 | Pass |
| Light danger text on error banner | `#b42318` | `#fdecea` | 5.75 | 4.5 | Pass |
| Light white on primary button | `#ffffff` | `#1d4ed8` | 6.70 | 4.5 | Pass |
| Light white on danger button | `#ffffff` | `#b42318` | 6.57 | 4.5 | Pass |
| Light control border on surface | `#767676` | `#ffffff` | 4.54 | 3.0 (non-text) | Pass |
| Dark text on page | `#ececf1` | `#16161d` | 15.29 | 4.5 | Pass |
| Dark text on surface | `#ececf1` | `#1f1f28` | 13.88 | 4.5 | Pass |
| Dark text on success banner | `#ececf1` | `#1d3a24` | 10.60 | 4.5 | Pass |
| Dark muted text | `#a9a9b5` | `#16161d` | 7.74 | 4.5 | Pass |
| Dark accent link | `#8ab4ff` | `#16161d` | 8.62 | 4.5 | Pass |
| Dark danger text on error banner | `#ff9b92` | `#3d1e1c` | 7.39 | 4.5 | Pass |
| Dark white on primary button | `#ffffff` | `#2b5cd6` | 5.83 | 4.5 | Pass |
| Dark white on danger button | `#ffffff` | `#b42318` | 6.57 | 4.5 | Pass |
| Dark control border on surface | `#8e8ea0` | `#1f1f28` | 5.08 | 3.0 (non-text) | Pass |
| Dark control border on page | `#8e8ea0` | `#16161d` | 5.59 | 3.0 (non-text) | Pass |

Decorative dividers (`#c4c4cc` light, `#3a3a46` dark) are not required to meet contrast and were not measured.

## Checklist A: Code quality

* No totals, validation or search logic added to `src/js/ui/**`. Passed.
* No `innerHTML`, inline handlers or `localStorage` in the UI. `scripts/check.js` passed. Passed.
* The new keydown handler uses the `on` attribute of `el()`. The dom allow-list was not changed in P5. Passed.
* Colour values appear only in the token blocks at the top of `src/css/main.css` and in the dark block. Passed (confirmed by grep).

## Checklist B: Security

* No new rendering path. Text is still set with `textContent`. Passed.

## NFR-04 manual checklist (WCAG 2.2 AA, partial)

Automated results are from the e2e spec. Manual items are not signed.

| Item | Status | Evidence |
|------|--------|----------|
| Text and control contrast | Automated (computed) | Contrast table above |
| Keyboard: Tab order reaches every control | Browser spot-check | P7 order-detail trace traversed the customer link, named table region, line controls, status actions, and navigation. Other routes remain unverified. |
| Keyboard: focus stays in open dialog | Automated | "focus stays inside the open dialog" passes (6 Tab presses) |
| Keyboard: Escape closes dialog, focus returns | Automated | "Escape closes the Delete order dialog and returns focus" passes |
| Keyboard: Cancel on line form returns focus | Automated | "Cancel on the line form returns focus to Add line" passes |
| Names and roles: unique ids on order detail | Automated | "has no duplicate ids on the order detail page" passes |
| Named scroll region | Automated (code) | `role="region"` and `aria-label` in `table.js`; not separately tested |
| Visible focus | Code review | `:focus-visible` outline in `main.css` |
| Zoom to 200% and 400% reflow | Not run | Manual |
| Screen reader pass (NVDA or VoiceOver) | Not run | Manual |
| Forced colours and Windows High Contrast | Browser emulation only | P7 forced-colors emulation rendered black text on white with visible controls; actual Windows High Contrast remains unverified. |
| Dark palette visual review | Reviewed in P7 | Order detail inspected at 360px and 768px; text and controls remained legible. |

Decision (2026-10-12): the user accepted the open items. P5 is closed with NFR-04 Partial. The manual items above are open risk and are not signed.

## Coverage

| Requirement | Status after P5 | Evidence |
|-------------|-----------------|----------|
| FR-17 | Done | P7 visual review of order detail at 360, 768 and 1280px; responsive e2e checks verify no page overflow on every route at 320, 360, 768 and 1280px. The order table scrolls within its named region on narrow screens. |
| NFR-04 | Partial | Automated keyboard, id and contrast evidence. Manual checklist items above are not run. |
| NFR-05 | Partial (P5) | `phone-360` project runs the accessibility spec. Cross-browser smoke run is P6. |

## AI output review

* Contrast values were first written without a calculation. They were then recomputed with a Node one-liner run in the workspace (no dependency added). The script output matches the table.
* Token values were read from `src/css/main.css` before this review was written.
* Control rules (44px targets, 1rem control fonts, `:focus-visible`) were read from `src/css/main.css`. Viewport meta in `src/index.html` has no `user-scalable=no`.
* Test evidence for the fixes is the accessibility spec: 6 failed before the fixes and 14 passed after.

## Next

P5 automated gates pass. The P5 gate stays open until the NFR-04 manual checklist is signed or its open items are accepted. P6 has not started and waits for user approval.
