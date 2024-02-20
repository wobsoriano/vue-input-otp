<script setup lang="ts">
import Page from './components/Page.vue'
import SiteHeader from './components/SiteHeader.vue';
</script>

<template>
  <div class="relative flex min-h-[100dvh] flex-col bg-background">
    <SiteHeader />
    <main class="flex-1 flex flex-col">
      <Page />
    </main>
  </div>
</template>
