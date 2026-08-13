---
"vue-input-otp": patch
---

Sync the input's value into state on mount. A password manager or the browser itself can autofill the input before hydration runs, leaving the DOM holding a code that `v-model` knew nothing about. The autofilled value is now adopted on mount without emitting `input`, since no user action produced it.
