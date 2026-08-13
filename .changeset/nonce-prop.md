---
"vue-input-otp": minor
---

Add a `nonce` prop. It is applied to the `<style>` tag the component injects, so a `style-src` Content Security Policy that requires nonces no longer blocks it.
