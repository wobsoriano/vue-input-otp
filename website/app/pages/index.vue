<script setup lang="ts">
import { GitHub } from '@/components/Icons'
import PageActions from '@/components/PageActions.vue'
import PageHeader from '@/components/PageHeader.vue'
import PageHeaderDescription from '@/components/PageHeaderDescription.vue'
import PageHeaderHeading from '@/components/PageHeaderHeading.vue'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const config = useRuntimeConfig()
</script>

<template>
  <div class="container relative flex-1 flex flex-col justify-center items-center w-full">
    <PageHeader>
      <PageHeaderHeading class="animate-in fade-in slide-in-from-top-8 duration-500 fill-mode-backwards">
        Stop wasting time building OTP inputs.
      </PageHeaderHeading>

      <Showcase
        class="animate-in fade-in slide-in-from-top-8 duration-500 delay-1000 fill-mode-backwards"
      />

      <PageHeaderDescription
        class="animate-in fade-in slide-in-from-top-8 duration-500 delay-3000 fill-mode-backwards"
      >
        One-time password input component for Vue. Accessible. Unstyled.
        Customizable. Open Source.
      </PageHeaderDescription>

      <PageActions
        class="animate-in fade-in slide-in-from-top-8 duration-500 delay-3000 fill-mode-backwards"
      >
        <div :class="buttonVariants({ variant: 'outline' })">
          <div class="text-muted-foreground pr-1">
            <span class="text-foreground">npm</span> install vue-input-otp
          </div>
          <CopyButton />
        </div>
        <a
          target="_blank"
          rel="noreferrer"
          :href="config.public.repoUrl"
          :class="cn(buttonVariants({ variant: 'outline' }))"
        >
          <GitHub class="mr-2 h-4 w-4" />
          GitHub
        </a>
      </PageActions>
    </PageHeader>
  </div>
</template>
