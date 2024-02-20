<script setup lang="ts">
import { OTPInput } from 'vue-input-otp'
import Slot from './Slot.vue'
import { ref, watchEffect } from 'vue';

const input = ref('')

watchEffect(() => {
  console.log('input', input.value)
})
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
    <!-- Fake Dash -->
    <div class="flex w-10 justify-center items-center">
      <div class="w-3 h-1 rounded-full bg-border" />
    </div>
    <div class="flex">
      <Slot v-bind="slot" :key="idx" v-for="(slot, idx) in slots.slice(3)" />
    </div>
  </OTPInput>
</template>
