<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = defineProps<{ class?: string }>()
</script>

<template>
  <h1 :class="cn('text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1] max-w-[330px] md:min-w-[540px]', props.class)">
    <slot />
  </h1>
</template>
