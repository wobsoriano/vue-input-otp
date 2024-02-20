import { defineComponent, h } from "vue";

export const PageHeader = defineComponent((_, { slots }) => {
  return () => h('section', {
    class: 'mx-auto flex max-w-[500px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20'
  }, slots.default?.())
})

export const PageHeaderHeading = defineComponent((_, { slots }) => {
  return () => h('h1', {
    class: 'text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1] max-w-[330px] md:min-w-[540px]'
  }, slots.default?.())
})

export const PageActions = defineComponent(() => {
  return () => h('p', {
    class: 'max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl text-pretty'
  })
})

export const PageHeaderDescription = defineComponent((_, { slots }) => {
  return () => h('div', {
    class: 'flex w-full items-center justify-center space-x-4 py-4 md:pb-10'
  }, slots.default?.())
})
