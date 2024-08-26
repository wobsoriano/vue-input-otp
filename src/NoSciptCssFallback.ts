import { defineComponent, h } from 'vue'

export const NOSCRIPT_CSS_FALLBACK = `
[data-input-otp] {
  --nojs-bg: white !important;
  --nojs-fg: black !important;

  background-color: var(--nojs-bg) !important;
  color: var(--nojs-fg) !important;
  caret-color: var(--nojs-fg) !important;
  letter-spacing: .25em !important;
  text-align: center !important;
  border: 1px solid var(--nojs-fg) !important;
  border-radius: 4px !important;
  width: 100% !important;
}
@media (prefers-color-scheme: dark) {
  [data-input-otp] {
    --nojs-bg: black !important;
    --nojs-fg: white !important;
  }
}`

export const NoSciptCssFallback = defineComponent({
  props: {
    fallback: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return () => h('noscript', { innerHTML: `<style>${props.fallback}</style>` })
  },
})
