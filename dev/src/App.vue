<script setup lang="ts">
import { OTPInput, REGEXP_ONLY_DIGITS } from 'vue-input-otp'
import { onMounted, onUnmounted, ref, watchEffect } from 'vue'
import Slot from './Slot.vue'

const input = ref('12')
const inputRef = ref<{ ref: HTMLInputElement } | null>(null)
const disabled = ref(false)

onMounted(() => {
  const isMobile = window.matchMedia('(max-width: 1023px)').matches
  if (!isMobile) {
    disabled.value = true
  }
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
    <form @submit="onSubmit" class="mx-auto flex max-w-[980px] justify-center pt-6 pb-4">
      <OTPInput
        @complete="onSubmit"
        v-slot="{ slots, isFocused }"
        ref="inputRef"
        v-model="input"
        :maxlength="6"
        allow-navigation
        :pattern="REGEXP_ONLY_DIGITS"
        container-class="group flex items-center"
        autofocus
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
        <div class="flex w-10 justify-center items-center">
          <div className="w-3 md:w-6 h-1 md:h-2 rounded-full bg-border"></div>
        </div>
        
        <div class="flex">
          <Slot
            v-for="(slot, idx) in slots.slice(3)"
            :is-focused="isFocused"
            :key="idx"
            v-bind="slot"
          />
        </div>
      </OTPInput>
    </form>
  </main>
</template>
