---
"vue-input-otp": patch
---

Measure `--root-height` from the container rather than the input, and fall back to `16px` until the variable resolves. Before the variable is set the invisible input inherited its font size, and when that inherited size was under 16px, iOS Safari zoomed the whole page on focus or back-navigation.
