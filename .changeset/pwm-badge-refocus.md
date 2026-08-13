---
"vue-input-otp": minor
---

Remove the re-focus behavior for password manager badges.

Detecting a badge used to blur and immediately re-focus the input, which emitted a spurious `blur` followed by `focus` even though the user never left the field. Any handler bound to `@blur` fired without user intent, and `isFocused` flickered false for consumers reading it through the default slot or `useVueOTPContext`. The sacrifice is that if a badge disappears, the user has to re-trigger focus themselves.
