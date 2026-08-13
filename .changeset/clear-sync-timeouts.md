---
"vue-input-otp": patch
---

Clear pending sync timeouts when the value changes again or the component unmounts. The autofill and selection sync timeouts could previously fire after unmount, touching a detached input.
