---
"vue-input-otp": patch
---

Log CSS rule insertion failures as warnings rather than errors. Some environments reject individual cosmetic selectors, `:autofill` in older Android WebViews for instance. Nothing breaks when that happens, but the `console.error` was captured by Sentry and similar tools as if the application had failed. Same message, warning level.
