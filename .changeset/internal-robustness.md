---
"vue-input-otp": patch
---

Internal robustness fixes. `ResizeObserver` is feature-detected before use, so browsers without it (iOS Safari below 13.4) no longer crash on mount. Pending sync timeouts are cleared when the value changes again or the component unmounts. CSS rule insertion failures log as warnings rather than errors, keeping them out of monitoring tools. `--root-height` is measured from the container and falls back to `16px` until it resolves. Autofill that lands before hydration is now adopted into `v-model` on mount instead of being dropped.
