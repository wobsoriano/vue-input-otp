---
"vue-input-otp": minor
---

Reserve the password manager badge gutter only where it fits.

Once a badge was detected, the input grew 40px past the container to push the badge off the last slot, and the only guard was the distance to the viewport's right edge. Inside a constrained scroll container such as a card or a modal, that overhang registered as scrollable overflow, so a horizontal scrollbar appeared and shifted the whole layout. The space check now measures the nearest ancestor that constrains horizontal overflow, and skips the push when the gutter does not fit. The badge then stays over the last slot, exactly as with `push-password-manager-strategy="none"`.
