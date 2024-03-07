<script setup lang="ts">
import { PageActions, PageHeader, PageHeaderDescription, PageHeaderHeading } from '~/components/PageHeader'
import { GitHub } from '~/components/Icons'
import { cn } from '~/lib/utils'
import siteConfig from '~/siteConfig'
import { buttonVariants } from '~/components/ui/button'

const fadeUpClass = 'lg:motion-safe:opacity-0 lg:motion-safe:animate-fade-up'
</script>

<template>
  <div class="container relative flex-1 flex flex-col justify-center items-center">
    <PageHeader>
      <PageHeaderHeading :class="fadeUpClass">
        Stop wasting time building OTP inputs.
      </PageHeaderHeading>

      <Showcase
        :class="cn(
          fadeUpClass,
          'lg:motion-safe:[animation-delay:1000ms]',
        )"
      />

      <PageHeaderDescription
        :class="cn(
          fadeUpClass,
          'lg:motion-safe:[animation-delay:3000ms]',
        )"
      >
        One-time password input component for Vue. Accessible. Unstyled.
        Customizable. Open Source.
      </PageHeaderDescription>

      <PageActions
        :class="cn(
          fadeUpClass,
          'lg:motion-safe:[animation-delay:3000ms]',
        )"
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
          :href="siteConfig.repoUrl"
          :class="cn(buttonVariants({ variant: 'outline' }))"
        >
          <GitHub class="mr-2 h-4 w-4" />
          GitHub
        </a>
      </PageActions>
    </PageHeader>
  </div>
</template>
