---
"vue-input-otp": minor
---

Opt the container out of browser translation. Chrome's translator rewrote the slots' text nodes by wrapping them in `<font>` elements, which broke rendering on the next update. This was easiest to hit with alphanumeric codes under an active page translation. A one-time code is never meaningful to translate.
