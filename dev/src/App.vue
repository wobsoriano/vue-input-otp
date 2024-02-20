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
  <OTPInput
    v-slot="{ slots }"
    v-model="input"
    :maxlength="6"
    container-class="group flex items-center has-[:disabled]:opacity-30"
  >
    <div class="flex">
      <Slot v-for="(slot, idx) in slots.slice(0, 3)" v-bind="slot" :key="idx" />
    </div>
    <!-- Fake Dash -->
    <div class="flex w-10 justify-center items-center">
      <div class="w-3 h-1 rounded-full bg-border" />
    </div>
    <div class="flex">
      <Slot v-for="(slot, idx) in slots.slice(3)" v-bind="slot" :key="idx" />
    </div>
  </OTPInput>
</template>
