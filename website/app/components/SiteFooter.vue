<script setup lang="ts">
const config = useRuntimeConfig()
</script>

<template>
  <footer class="py-6 md:px-8 md:py-0">
    <div class="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
      <p class="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
        Built by
        <a
          :href="config.public.twitterUrl"
          target="_blank"
          rel="noreferrer"
          class="font-medium underline underline-offset-4"
        >
          wobsoriano
        </a>. Thanks to <a
          target="_blank"
          rel="noreferrer"
          class="font-medium underline underline-offset-4" href="https://twitter.com/guilherme_rodz"
        >guilhermerodz</a>. The source code is available on
        <a
          :href="config.public.repoUrl"
          target="_blank"
          rel="noreferrer"
          class="font-medium underline underline-offset-4"
        >
          GitHub
        </a>
        .
      </p>
    </div>
  </footer>
</template>
