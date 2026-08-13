# vue-input-otp

## 0.4.0

### Minor Changes

- 2e6c64f: Port fixes from `input-otp` 1.5.0-beta.1. Behavior changes worth knowing about:

  - The password manager badge push now measures against the nearest element constraining horizontal overflow, not just the viewport. Inside a card or modal the input no longer overhangs its container and forces a horizontal scrollbar. Where the gutter doesn't fit, the badge stays over the last slot, as with `push-password-manager-strategy="none"`.
  - Detecting a badge no longer blurs and re-focuses the input, which was emitting a spurious `blur` then `focus` at consumers without any user action.
  - `placeholderChar` is now `null` on every slot once the value is non-empty. Previously a filled slot reported its own character, and placeholders kept rendering on empty slots after typing began, contradicting the `data-input-otp-placeholder-shown` attribute.
  - `spellcheck` defaults to `false` so browsers stop underlining a filled code as a misspelling. Passing your own value still overrides it.
  - The container carries `translate="no"`. Chrome's translator rewrote slot text nodes and broke rendering, and a one-time code is never meaningful to translate.

  Adds a `nonce` prop, applied to the `<style>` tag the component injects, so a `style-src` Content Security Policy requiring nonces no longer blocks it.

### Patch Changes

- 2e6c64f: Internal robustness fixes. `ResizeObserver` is feature-detected before use, so browsers without it (iOS Safari below 13.4) no longer crash on mount. Pending sync timeouts are cleared when the value changes again or the component unmounts. CSS rule insertion failures log as warnings rather than errors, keeping them out of monitoring tools. `--root-height` is measured from the container and falls back to `16px` until it resolves. Autofill that lands before hydration is now adopted into `v-model` on mount instead of being dropped.

## 0.3.2

### Patch Changes

- 45e8ae1: Switch to OIDC for npm publishing

## 0.3.1

### Patch Changes

- 45e3d44: Removed the default pattern.

## 0.3.0

### Minor Changes

- a1f17dc: Introduce `useVueOTPContext` to allow access to slots, focused and hovering states throughout the component tree.

## 0.2.2

### Patch Changes

- 600016f: Add package keywords

## 0.2.1

### Patch Changes

- 7d6ee46: Fix password manager positioning

## 0.2.0

### Minor Changes

- b2af761: Password manager support and more improvements
- 6a4ca68: Emit the value instead of event from input event

### Patch Changes

- 9ef505c: Remove console logs
- c3c427c: Fix paste listener
