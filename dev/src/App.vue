<script setup lang="ts">
import { OTPInput } from 'vue-input-otp'
import { ref, watchEffect } from 'vue'
import Slot from './Slot.vue'

const input = ref('')

watchEffect(() => {
  // console.log('input', input.value)
})
</script>

<template>
  <form class="mx-auto flex max-w-[980px] justify-center pt-6 pb-4">
    <OTPInput
      v-slot="{ slots }"
      v-model="input"
      :maxlength="6"
      container-class="group flex items-center"
      autofocus
    >
      <div class="flex">
        <Slot v-for="(slot, idx) in slots.slice(0, 3)" v-bind="slot" :key="idx" />
      </div>
      <!-- Fake Dash -->
      <div class="flex w-10 justify-center items-center">
        <div className="w-3 md:w-6 h-1 md:h-2 rounded-full bg-border"></div>
      </div>
      <div class="flex">
        <Slot v-for="(slot, idx) in slots.slice(3)" v-bind="slot" :key="idx" />
      </div>
    </OTPInput>
  </form>
</template>
