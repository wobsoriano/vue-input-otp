---
"vue-input-otp": patch
---

Feature-detect `ResizeObserver` before observing. Browsers without it, such as iOS Safari below 13.4, crashed on mount. When the observer is unavailable the root height is now simply measured once on mount.
