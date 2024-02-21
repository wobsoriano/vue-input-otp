<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import Page from './components/Page.vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
</script>

<template>
  <Toaster />
  <div class="relative flex min-h-[100dvh] flex-col bg-background">
    <SiteHeader />
    <main class="flex-1 flex flex-col">
      <Page />
    </main>
    <SiteFooter />
  </div>
</template>
