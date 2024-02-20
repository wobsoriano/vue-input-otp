<script setup lang="ts">
import { CheckIcon, CopyIcon } from '@radix-icons/vue'
import { ref, watch } from 'vue'
import { Button } from './ui/button'

const hasCopied = ref(false)

function copyToClipboardWithMeta(value: string) {
  window && window.isSecureContext && navigator.clipboard.writeText(value)
  hasCopied.value = true
}

watch(hasCopied, () => {
  setTimeout(() => {
    hasCopied.value = false
  }, 2000)
})
</script>

<template>
  <Button
    size="icon"
    variant="ghost"
    class="relative z-10 h-6 w-6 text-zinc-50 hover:bg-zinc-700 hover:text-zinc-50"
    @click="copyToClipboardWithMeta('npm install vue-input-otp')"
  >
    <span class="sr-only">Copy</span>
    <CheckIcon v-if="hasCopied" class="h-3 w-3" />
    <CopyIcon v-else class="h-3 w-3" />
  </Button>
</template>
