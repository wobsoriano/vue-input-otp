<script lang="ts" setup>
import { Toaster as Sonner, type ToasterProps } from 'vue-sonner'

const props = defineProps<ToasterProps>()
</script>

<template>
  <Sonner
    class="toaster group"
    :class-names="{
      toast:
        'group toast group-[.toaster]:bg-background/20 group-[.toaster]:backdrop-blur-sm group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
      description: 'group-[.toast]:text-muted-foreground',
      actionButton:
        'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
      cancelButton:
        'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
    }"
    v-bind="props"
    theme="dark"
    position="top-right"
  />
</template>
