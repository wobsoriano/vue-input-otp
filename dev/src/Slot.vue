<script setup lang="ts">
defineProps<{
  char: string | null
  isActive: boolean
}>()
</script>

<template>
  <div
    class="relative w-10 h-14 text-[2rem] flex items-center justify-center transition-all duration-300 border-border border-y border-r first:border-l first:rounded-l-md last:rounded-r-md group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20 outline outline-0 outline-accent-foreground/20" :class="{
      'outline-4 outline-accent-foreground z-10': isActive,
    }"
  >
    <div v-if="char !== null">
      {{ char }}
    </div>
    <!-- Fake Caret -->
    <div v-if="char === null && isActive" class="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink">
      <div class="w-px h-8 bg-white" />
    </div>
  </div>
</template>
