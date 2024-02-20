<script setup lang="ts">
import { cn } from '@/lib/utils';
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from './PageHeader';
import Showcase from './Showcase.vue';

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
    </PageHeader>
  </div>
</template>
