---
description: "Use when writing or changing UI code: views, components, forms, rendering, routing, DOM events, CSS, responsive layout, mobile, security, XSS, empty and error states, accessibility. Covers layering, safe rendering, security rules, responsive design, form validation display and required states."
applyTo: "src/js/ui/**,src/js/main.js,src/css/**,src/index.html"
---
# UI Layer Guidelines

Complements [AGENTS.md](../../AGENTS.md) and [domain.instructions.md](domain.instructions.md); do not repeat their rules here.

## Layering

* UI imports from `domain/`, `storage/` and `utils/`. Domain and storage never import from `ui/`.
* Never compute totals, validate, search or filter inline. Call `orderTotalCents`, the domain validators and the domain search/filter functions.
* Format money only at render time through a single shared helper in `utils/` (cents to display string); no `toFixed` scattered across views.
* Views in `ui/views/` own a screen (customers, customer detail, order detail); reusable pieces (form field, empty state, confirm dialog, table) live in `ui/components/`.
* A view exports a function that takes its dependencies (repositories, navigate callback) and returns a DOM element, so it can be re-rendered from state rather than patched in place.

## Safe rendering

* Build DOM with `createElement`, `textContent` and `append`. Do not use `innerHTML`, `outerHTML` or `insertAdjacentHTML` with any data that came from user input or storage.
* Static markup with no interpolated data is the only acceptable `innerHTML` use; prefer a small `el(tag, props, ...children)` helper in `utils/` instead.
* Attach listeners with `addEventListener`; no inline `onclick` attributes.

## Security

* Treat everything read from `localStorage`, the URL hash and form inputs as untrusted. Storage can be edited by the user or other scripts, so a stored name is as dangerous as a typed one.
* Never use `eval`, `new Function`, string arguments to `setTimeout`/`setInterval`, or `document.write`.
* Set element properties and attributes only from a fixed allow-list of names. Never copy user-provided keys onto an element (for example `Object.assign(el, userData)`).
* Never put user data into `href`, `src` or `style`. If a link is unavoidable, allow only `http:` and `https:` after parsing with `new URL()`; reject `javascript:` and `data:`.
* Route parameters from `location.hash` are looked up by ID in the repositories; an unknown or malformed ID shows a not-found state and is never rendered or interpolated.
* `src/index.html` carries a CSP `<meta>` tag: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'`. Do not add inline `<script>`, inline `<style>` or inline event handlers, and do not load scripts, fonts or styles from a CDN.
* Do not store secrets or anything beyond the app's own data in `localStorage`, and do not log entered customer data to the console.
* When exporting or downloading data, build it from domain objects and set the filename from a sanitised constant, not from user text.

## Forms and validation

* Submit handlers call the domain validator and branch on `{ ok, errors }`; never throw for user input.
* Show each message from `errors` inline next to its field, linked with `aria-describedby`, and mark the field `aria-invalid="true"`. Clear stale errors on the next submit.
* Keep the user's entered values when validation fails.
* Repository save results use the same `{ ok, errors }` shape; a `storage` error shows as a form-level alert (`role="alert"`) above the form, and the entered values stay.

## Required states

* Every list has an empty state with a call to action, and a "no results" state distinct from "nothing created yet" when a search or filter is active.
* Deleting a customer asks for confirmation. If `customerDeletionImpact` says orders exist, show the block (or explicit cascade choice) before anything is removed.
* Deleting an order or order line asks for confirmation unless it is trivially undoable.
* Order detail shows the derived total and updates it after every line add, edit or remove.
* When storage reports that corrupt data was reset, show a dismissible banner (`role="status"`) on the customers list noting that a backup was kept; the app must still load with an empty state.
* When a save fails (quota or private mode), show a persistent error banner (`role="alert"`) with a retry hint; never silently drop the change.

## Accessibility and CSS

* Use semantic elements (`button`, `form`, `table`, `label`, `nav`, `main`); every input has a `<label>`.
* Interactive elements are reachable and operable by keyboard; dialogs trap focus and restore it on close.
* Plain CSS in `src/css/`; no preprocessors or frameworks. Use CSS custom properties for colours and spacing, and keep focus outlines visible.

## Responsive layout

* Mobile first: base styles target a 320px-wide viewport, and `min-width` media queries add layout for larger screens. Suggested breakpoints are 600px and 960px.
* `src/index.html` includes `<meta name="viewport" content="width=device-width, initial-scale=1">`. Never disable zoom with `user-scalable=no` or `maximum-scale`.
* No horizontal page scroll at any width from 320px up. Wide tables (such as order lines) sit in a wrapper with `overflow-x: auto`, or collapse to stacked cards on narrow screens.
* Use relative units (`rem`, `%`, `fr`, `minmax()`) and Flexbox or Grid with `flex-wrap`/`auto-fit`. No fixed pixel widths for containers; avoid fixed heights on content.
* Touch targets are at least 44x44px. Form controls use a font size of at least 16px so mobile browsers do not zoom on focus.
* Stack form fields vertically on narrow screens and place primary actions where a thumb can reach them.
* Respect `prefers-reduced-motion` and `prefers-color-scheme`, and keep text contrast at WCAG AA (4.5:1) in every theme.
* Don't hide functionality on small screens; every action available on desktop must be reachable on mobile.

## Routing

* Use hash-based routes handled in `main.js`; an unknown route falls back to the customers list rather than a blank page.

## Testing

* DOM code is not covered by `node --test`. Keep logic out of the UI so domain tests cover it, and check any UI change manually in the browser at `http://localhost:5173`: empty state, validation error, and a reload to confirm persistence.
* Also check the layout at 320px, 768px and 1280px widths, and enter `<img src=x onerror=alert(1)>` as a customer name and order line description to confirm it renders as plain text.
