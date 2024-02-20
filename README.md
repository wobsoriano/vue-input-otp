# OTP Input for Vue

## Installation

```bash
npm install vue-input-otp
```

## Usage

The example below uses `tailwindcss`:

```vue
<script setup lang="ts">
import { OTPInput } from 'vue-input-otp'
</script>

<template>
  <OTPInput
    :maxlength="6"
    container-class="group flex items-center has-[:disabled]:opacity-30"
    v-model="input"
    v-slot="{ slots }"
  >
    <div class="flex">
      <Slot v-bind="slot" :key="idx" v-for="(slot, idx) in slots.slice(0, 3)" />
    </div>

    <!-- Fake Dash. Inspired by Stripe's MFA input. -->
    <div class="flex w-10 justify-center items-center">
      <div class="w-3 h-1 rounded-full bg-border" />
    </div>

    <div class="flex">
      <Slot v-bind="slot" :key="idx" v-for="(slot, idx) in slots.slice(3)" />
    </div>
  </OTPInput>
</template>
```

```vue
<script setup lang="ts">
defineProps<{
  char: string | null
  isActive: boolean
}>()
</script>

<template>
  <div
    :class="{
      'relative w-10 h-14 text-[2rem]': true,
      'flex items-center justify-center': true,
      'transition-all duration-300': true,
      'border-border border-y border-r first:border-l first:rounded-l-md last:rounded-r-md': true,
      'group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20': true,
      'outline outline-0 outline-accent-foreground/20': true,
      'outline-4 outline-accent-foreground z-10': isActive
    }"
  >
    <div v-if="char !== null">{{ char }}</div>
    <!-- Emulate a Fake Caret -->
    <div v-if="char === null && isActive" class="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink">
      <div class="w-px h-8 bg-white" />
    </div>
  </div>
</template>
```

```ts
// tailwind.config.ts for the blinking caret animation.
const config = {
  theme: {
    extend: {
      keyframes: {
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' },
        },
      },
      animation: {
        'caret-blink': 'caret-blink 1.2s ease-out infinite',
      },
    },
  },
}
```

## License

MIT
