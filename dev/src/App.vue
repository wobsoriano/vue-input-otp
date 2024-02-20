<script setup lang="ts">
import { OTPInput, REGEXP_ONLY_DIGITS } from 'vue-input-otp'
import { onMounted, onUnmounted, ref } from 'vue'
import Slot from './Slot.vue'

const input = ref('12')
const inputRef = ref<{ ref: HTMLInputElement } | null>(null)
const disabled = ref(false)

onMounted(() => {
  const isMobile = window.matchMedia('(max-width: 1023px)').matches
  if (!isMobile)
    disabled.value = true

  const t1 = setTimeout(() => {
    disabled.value = false
  }, 1_900)
  const t2 = setTimeout(
    () => {
      inputRef.value?.ref.focus()
    },
    isMobile ? 0 : 2_500,
  )

  onUnmounted(() => {
    clearTimeout(t1)
    clearTimeout(t2)
  })
})

function onSubmit(e?: Event) {
  e?.preventDefault?.()
}
</script>

<template>
  <main class="flex-1 flex flex-col">
    <form class="mx-auto flex max-w-[980px] justify-center pt-6 pb-4" @submit="onSubmit">
      <OTPInput
        ref="inputRef"
        v-slot="{ slots, isFocused }"
        v-model="input"
        :disabled="disabled"
        :maxlength="6"
        allow-navigation
        :pattern="REGEXP_ONLY_DIGITS"
        container-class="group flex items-center"
        @complete="onSubmit"
      >
        <div class="flex">
          <Slot
            v-for="(slot, idx) in slots.slice(0, 3)"
            :key="idx"
            :is-focused="isFocused"
            :animate-idx="idx"
            v-bind="slot"
          />
        </div>

        <!-- Layout inspired by Stripe -->
        <div class="flex w-10 md:20 justify-center items-center">
          <div class="w-3 md:w-6 h-1 md:h-2 rounded-full bg-border"></div>
        </div>

        <div class="flex">
          <Slot
            v-for="(slot, idx) in slots.slice(3)"
            :key="idx"
            :is-focused="isFocused"
            v-bind="slot"
          />
        </div>
      </OTPInput>
    </form>
  </main>
</template>
