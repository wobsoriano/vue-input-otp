<script setup lang="ts">
import { buttonVariants } from './ui/button'
import { GitHub, Twitter } from './Icons'
import { cn } from '@/lib/utils'

const config = useRuntimeConfig()
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container flex h-14 max-w-screen-2xl items-center">
      <!-- <MainNav />
        <MobileNav /> -->
      <div class="flex flex-1 items-center justify-between space-x-2 md:justify-end">
        <!-- <div class="w-full flex-1 md:w-auto md:flex-none">
            <CommandMenu />
          </div> -->
        <nav class="flex items-center">
          <a
            :href="config.public.repoUrl"
            target="_blank"
            rel="noreferrer"
          >
            <div
              :class="cn(
                buttonVariants({
                  variant: 'ghost',
                }),
                'w-9 px-0',
              )"
            >
              <GitHub class="h-4 w-4" />
              <span class="sr-only">GitHub</span>
            </div>
          </a>
          <a
            :href="config.public.twitterUrl"
            target="_blank"
            rel="noreferrer"
          >
            <div
              :class="cn(
                buttonVariants({
                  variant: 'ghost',
                }),
                'w-9 px-0',
              )"
            >
              <Twitter class="h-3 w-3 fill-current" />
              <span class="sr-only">Twitter</span>
            </div>
          </a>
        </nav>
      </div>
    </div>
  </header>
</template>
