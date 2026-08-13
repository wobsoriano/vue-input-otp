---
"vue-input-otp": minor
---

Port fixes from `input-otp` 1.5.0-beta.1. Behavior changes worth knowing about:

- The password manager badge push now measures against the nearest element constraining horizontal overflow, not just the viewport. Inside a card or modal the input no longer overhangs its container and forces a horizontal scrollbar. Where the gutter doesn't fit, the badge stays over the last slot, as with `push-password-manager-strategy="none"`.
- Detecting a badge no longer blurs and re-focuses the input, which was emitting a spurious `blur` then `focus` at consumers without any user action.
- `placeholderChar` is now `null` on every slot once the value is non-empty. Previously a filled slot reported its own character, and placeholders kept rendering on empty slots after typing began, contradicting the `data-input-otp-placeholder-shown` attribute.
- `spellcheck` defaults to `false` so browsers stop underlining a filled code as a misspelling. Passing your own value still overrides it.
- The container carries `translate="no"`. Chrome's translator rewrote slot text nodes and broke rendering, and a one-time code is never meaningful to translate.

Adds a `nonce` prop, applied to the `<style>` tag the component injects, so a `style-src` Content Security Policy requiring nonces no longer blocks it.
