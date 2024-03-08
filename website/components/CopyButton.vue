<script setup lang="ts">
import { CheckIcon, CopyIcon } from '@radix-icons/vue'
import { ref, watch } from 'vue'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const hasCopied = ref(false)

const menuItems = ['npm', 'yarn', 'pnpm', 'bun']

function copyToClipboardWithMeta(value: string) {
  const cmd = value === 'npm' ? 'npm install vue-input-otp' : `${value} add vue-input-otp`

  window && window.isSecureContext && navigator.clipboard.writeText(cmd)
  hasCopied.value = true
}

watch(hasCopied, () => {
  setTimeout(() => {
    hasCopied.value = false
  }, 2000)
})
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        size="icon"
        variant="ghost"
        class="relative z-10 h-6 w-6 text-zinc-50 hover:bg-zinc-700 hover:text-zinc-50"
      >
        <CheckIcon v-if="hasCopied" class="h-3 w-3" />
        <CopyIcon v-else class="h-3 w-3" />
        <span class="sr-only">Copy</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem
        v-for="item in menuItems"
        :key="item"
        @click="copyToClipboardWithMeta(item)"
      >
        {{ item }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
