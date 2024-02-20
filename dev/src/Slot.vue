<script setup lang="ts">
defineProps<{
  char: string | null
  isActive: boolean
}>()
</script>

<template>
  <div
    class="relative w-10 md:w-20 h-14 md:h-28 text-[2rem] md:text-[4rem] flex items-center justify-center border-border border-y border-r first:border-l first:rounded-l-md last:rounded-r-md transition-all [transition-duration:300ms] outline outline-0 outline-accent-foreground/20 group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20"
    :class="{
      'outline-4 outline-accent-foreground': isActive,
    }"
  >
    <div v-if="char !== null">
      {{ char }}
    </div>
    <!-- Fake Caret -->
    <div v-if="char === null && isActive" class="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink">
      <div class="w-px h-8 md:w-0.5 md:h-16 bg-white" />
    </div>
  </div>
</template>
