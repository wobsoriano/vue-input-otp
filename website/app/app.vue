<script setup lang="ts">
useHead({
  htmlAttrs: {
    class: '[color-scheme:dark]',
  },
  bodyAttrs: {
    class: 'min-h-[100dvh] bg-background font-sans antialiased dark',
  },
})
</script>

<template>
  <div class="relative flex min-h-[100dvh] flex-col bg-background">
    <SiteHeader />
    <main class="flex-1 flex flex-col w-full items-center">
      <NuxtPage />
    </main>
    <SiteFooter />
  </div>
  <Toaster />
</template>
