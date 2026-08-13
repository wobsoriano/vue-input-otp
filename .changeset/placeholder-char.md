---
"vue-input-otp": minor
---

Fix `placeholderChar` in the default slot.

A filled slot reported its own character as `placeholderChar` instead of `null`, and placeholders kept rendering on the still-empty slots after typing began. This contradicted the component's own `data-input-otp-placeholder-shown` attribute, which is only present while the value is empty. `placeholderChar` is now `null` on every slot as soon as the value is non-empty, matching the attribute and the React implementation.
