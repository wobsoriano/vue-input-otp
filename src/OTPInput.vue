<script setup lang="ts">
import type { StyleValue } from 'vue'
import type { OTPInputEmits, OTPInputProps, RenderProps } from './types'
import { defaultDocument, defaultWindow, reactiveOmit, useEventListener, usePrevious } from '@vueuse/core'
import { useForwardProps } from 'reka-ui'
import { computed, onMounted, onUnmounted, provide, shallowRef, watch, watchEffect } from 'vue'
import { NoSciptCssFallback, NOSCRIPT_CSS_FALLBACK } from './NoSciptCssFallback'
import { REGEXP_ONLY_DIGITS } from './regexp'
import { PublicVueOTPContextKey } from './symbols'
import { syncTimeouts } from './sync-timeouts'
import { usePasswordManagerBadge } from './use-pwm-badge'

defineOptions({
  name: 'OTPInput',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<OTPInputProps>(), {
  pattern: REGEXP_ONLY_DIGITS,
  inputmode: 'numeric',
  autocomplete: 'one-time-code',
  textAlign: 'left',
  pushPasswordManagerStrategy: 'increase-width',
  noScriptCssFallback: NOSCRIPT_CSS_FALLBACK,
  defaultValue: '',
})

const emit = defineEmits<OTPInputEmits>()

const [internalValue] = defineModel<string>({
  default(props) {
    return props.defaultValue
  },
})
const previousValue = usePrevious(internalValue)

const regexp = computed(() => props.pattern
  ? typeof props.pattern === 'string'
    ? new RegExp(props.pattern)
    : props.pattern
  : null)

/** Mirrors for UI rendering purpose only */
const isHoveringInput = shallowRef(false)
const isFocused = shallowRef(false)
const mirrorSelectionStart = shallowRef<number | null>(null)
const mirrorSelectionEnd = shallowRef<number | null>(null)

const inputRef = shallowRef<HTMLInputElement | null>(null)

const containerRef = shallowRef<HTMLDivElement | null>(null)
const isIOS = defaultWindow?.CSS?.supports?.('-webkit-touch-callout', 'none')

// eslint-disable-next-line prefer-const
let inputMetadataRef: {
  prev: [number | null | undefined, number | null | undefined, 'none' | 'forward' | 'backward' | null | undefined]
} = {
  prev: [
    inputRef.value?.selectionStart,
    inputRef.value?.selectionEnd,
    inputRef.value?.selectionDirection,
  ],
}

function safeInsertRule(sheet: CSSStyleSheet, rule: string) {
  try {
    sheet.insertRule(rule)
  }
  catch {
    console.error('input-otp could not insert CSS rule:', rule)
  }
}

onMounted(() => {
  const input = inputRef.value
  const container = containerRef.value

  if (!input || !container) {
    return
  }

  // Previous selection
  inputMetadataRef.prev = [
    input.selectionStart,
    input.selectionEnd,
    input.selectionDirection ?? 'none',
  ]

  const removeSelectionchangeListener = useEventListener(defaultDocument, 'selectionchange', onDocumentSelectionChange, {
    capture: true,
  })

  function onDocumentSelectionChange() {
    if (!input) {
      return
    }

    if (defaultDocument?.activeElement !== input) {
      mirrorSelectionStart.value = null
      mirrorSelectionEnd.value = null
      return
    }

    // Aliases
    const _s = input.selectionStart
    const _e = input.selectionEnd
    const _dir = input.selectionDirection
    const _ml = input.maxLength
    const _val = input.value
    const _prev = inputMetadataRef.prev

    // Algorithm
    let start = -1
    let end = -1
    // eslint-disable-next-line no-undef-init
    let direction: 'forward' | 'backward' | 'none' | undefined = undefined
    if (_val.length !== 0 && _s !== null && _e !== null) {
      const isSingleCaret = _s === _e
      const isInsertMode = _s === _val.length && _val.length < _ml

      if (isSingleCaret && !isInsertMode) {
        const c = _s
        if (c === 0) {
          start = 0
          end = 1
          direction = 'forward'
        }
        else if (c === _ml) {
          start = c - 1
          end = c
          direction = 'backward'
        }
        else if (_ml > 1 && _val.length > 1) {
          let offset = 0
          if (_prev[0] !== null && _prev[1] !== null) {
            direction = c < _prev[1]! ? 'backward' : 'forward'
            const wasPreviouslyInserting
              = _prev[0] === _prev[1] && _prev[0]! < _ml
            if (direction === 'backward' && !wasPreviouslyInserting) {
              offset = -1
            }
          }

          start = offset + c
          end = offset + c + 1
        }
      }

      if (start !== -1 && end !== -1 && start !== end) {
        input.setSelectionRange(start, end, direction)
      }
    }

    // Finally, update the state
    const s = start !== -1 ? start : _s
    const e = end !== -1 ? end : _e
    const dir = direction ?? _dir
    mirrorSelectionStart.value = s
    mirrorSelectionEnd.value = e
    // Store the previous selection value
    inputMetadataRef.prev = [s, e, dir]
  }

  // Set initial mirror state
  onDocumentSelectionChange()
  if (defaultDocument?.activeElement === input) {
    isFocused.value = true
  }

  // Apply needed styles
  if (!defaultDocument?.getElementById('input-otp-style')) {
    // eslint-disable-next-line ts/no-non-null-asserted-optional-chain
    const styleEl = defaultDocument?.createElement('style')!
    styleEl.id = 'input-otp-style'
    defaultDocument?.head.appendChild(styleEl)

    if (styleEl.sheet) {
      const autofillStyles
        = 'background: transparent !important; color: transparent !important; border-color: transparent !important; opacity: 0 !important; box-shadow: none !important; -webkit-box-shadow: none !important; -webkit-text-fill-color: transparent !important;'

      safeInsertRule(
        styleEl.sheet,
        '[data-input-otp]::selection { background: transparent !important; color: transparent !important; }',
      )
      safeInsertRule(
        styleEl.sheet,
        `[data-input-otp]:autofill { ${autofillStyles} }`,
      )
      safeInsertRule(
        styleEl.sheet,
        `[data-input-otp]:-webkit-autofill { ${autofillStyles} }`,
      )
      // iOS
      safeInsertRule(
        styleEl.sheet,
        `@supports (-webkit-touch-callout: none) { [data-input-otp] { letter-spacing: -.6em !important; font-weight: 100 !important; font-stretch: ultra-condensed; font-optical-sizing: none !important; left: -1px !important; right: 1px !important; } }`,
      )
      // PWM badges
      safeInsertRule(
        styleEl.sheet,
        `[data-input-otp] + * { pointer-events: all !important; }`,
      )
    }
  }
  // Track root height
  const updateRootHeight = () => {
    if (container) {
      container.style.setProperty(
        '--root-height',
        `${input.clientHeight}px`,
      )
    }
  }
  updateRootHeight()
  const resizeObserver = new ResizeObserver(updateRootHeight)
  resizeObserver.observe(input)

  onUnmounted(() => {
    removeSelectionchangeListener()
    resizeObserver.disconnect()
  })
})

/** Effects */
watch([internalValue], () => {
  syncTimeouts(() => {
    const input = inputRef.value
    if (!input)
      return
    // Forcefully remove :autofill state
    inputRef.value?.dispatchEvent(new Event('input'))

    // Update the selection state
    const s = inputRef.value?.selectionStart
    const e = inputRef.value?.selectionEnd
    const dir = inputRef.value?.selectionDirection
    if (s !== null && e !== null) {
      // TODO: Below is expected to be nulls
      mirrorSelectionStart.value = s ?? null
      mirrorSelectionEnd.value = e ?? null
      inputMetadataRef.prev = [s, e, dir]
    }
  })
}, {
  immediate: true,
})

watchEffect(() => {
  if (previousValue.value === undefined) {
    return
  }

  if (
    internalValue.value !== previousValue.value
    && previousValue.value.length < props.maxlength
    && internalValue.value.length === props.maxlength
  ) {
    emit('complete', internalValue.value)
  }
})

const pwmb = usePasswordManagerBadge({
  containerRef,
  inputRef,
  pushPasswordManagerStrategy: props.pushPasswordManagerStrategy,
  isFocused,
})

/** Event handlers */
function _beforeInputListener(e: InputEvent) {
  if (e.inputType === 'insertText' && e.data !== null) {
    const target = e.currentTarget as HTMLInputElement
    const start = target.selectionStart ?? 0
    const end = target.selectionEnd ?? 0
    const currentValue = target.value
    const isReplacing = start !== end
    const newValueUncapped = isReplacing
      ? currentValue.slice(0, start) + e.data + currentValue.slice(end)
      : currentValue.slice(0, start) + e.data + currentValue.slice(start)
    const newValue = newValueUncapped.slice(0, props.maxlength)
    if (newValue.length > 0 && regexp.value && !regexp.value.test(newValue)) {
      e.preventDefault()
    }
  }
}

function _inputListener(e: Event) {
  const newValue = (e.currentTarget as HTMLInputElement).value.slice(0, props.maxlength)
  if (newValue.length > 0 && regexp.value && !regexp.value.test(newValue)) {
    e.preventDefault()
    return
  }
  const maybeHasDeleted
    = typeof previousValue.value === 'string'
      && newValue.length < previousValue.value.length
  if (maybeHasDeleted) {
    // Since cutting/deleting text doesn't trigger
    // selectionchange event, we'll have to dispatch it manually.
    // NOTE: The following line also triggers when cmd+A then pasting
    // a value with smaller length, which is not ideal for performance.
    defaultDocument?.dispatchEvent(new Event('selectionchange'))
  }

  internalValue.value = newValue
  emit('input', newValue)
}

function _focusListener() {
  const input = inputRef.value
  if (input) {
    const start = Math.min(input.value.length, props.maxlength - 1)
    const end = input.value.length
    input.setSelectionRange(start, end)
    mirrorSelectionStart.value = start
    mirrorSelectionEnd.value = end
  }
  isFocused.value = true
}

// Fix iOS pasting
function _pasteListener(e: ClipboardEvent) {
  const input = inputRef.value
  if (!input)
    return

  if (!props.pasteTransformer && (!isIOS || !e.clipboardData || !input)) {
    return
  }

  const _content = e?.clipboardData?.getData('text/plain')
  const content = props?.pasteTransformer
    ? props.pasteTransformer(_content)
    : _content
  e.preventDefault()

  const start = inputRef.value?.selectionStart
  const end = inputRef.value?.selectionEnd

  const isReplacing = start !== end

  const newValueUncapped = isReplacing
    ? internalValue.value.slice(0, start!) + content + internalValue.value.slice(end!) // Replacing
    : internalValue.value.slice(0, start!) + content + internalValue.value.slice(start!) // Inserting
  const newValue = newValueUncapped.slice(0, props.maxlength)

  if (newValue.length > 0 && regexp.value && !regexp.value.test(newValue)) {
    return
  }

  internalValue.value = newValue
  emit('input', newValue)

  const _start = Math.min(newValue.length, props.maxlength - 1)
  const _end = newValue.length

  input?.setSelectionRange(_start, _end)
  mirrorSelectionStart.value = _start
  mirrorSelectionEnd.value = _end
}

// @ts-expect-error modelValue props from defineModel?
const delegatedProps = reactiveOmit(props, 'containerClass', 'value', 'pattern', 'defaultValue', 'pushPasswordManagerStrategy', 'noScriptCssFallback', 'modelValue')
const inputProps = useForwardProps(delegatedProps)

/** Styles */
const rootStyle = computed<StyleValue>(
  () => ({
    position: 'relative',
    cursor: props.disabled ? 'default' : 'text',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    pointerEvents: 'none',
  }),
)

const inputStyle = computed<StyleValue>(
  () => ({
    position: 'absolute',
    inset: 0,
    width: pwmb.willPushPWMBadge.value
      ? `calc(100% + ${pwmb.PWM_BADGE_SPACE_WIDTH})`
      : '100%',
    clipPath: pwmb.willPushPWMBadge.value
      ? `inset(0 ${pwmb.PWM_BADGE_SPACE_WIDTH} 0 0)`
      : undefined,
    height: '100%',
    display: 'flex',
    textAlign: props.textAlign,
    opacity: '1', // Mandatory for iOS hold-paste
    color: 'transparent',
    pointerEvents: 'all',
    background: 'transparent',
    caretColor: 'transparent',
    border: '0 solid transparent',
    outline: '0 solid transparent',
    boxShadow: 'none',
    lineHeight: '1',
    letterSpacing: '-.5em',
    fontSize: 'var(--root-height)',
    fontFamily: 'monospace',
    fontVariantNumeric: 'tabular-nums',
  }),
)

const contextValue = computed<RenderProps>(() => {
  return {
    slots: Array.from({ length: Number(props.maxlength) }).map((_, slotIdx) => {
      const isActive
        = isFocused.value
          && mirrorSelectionStart.value !== null
          && mirrorSelectionEnd.value !== null
          && ((mirrorSelectionStart.value === mirrorSelectionEnd.value
            && slotIdx === mirrorSelectionStart.value)
          || (slotIdx >= mirrorSelectionStart.value && slotIdx < mirrorSelectionEnd.value))

      const char = internalValue.value[slotIdx] !== undefined ? internalValue.value[slotIdx] : null
      const placeholderChar = char ?? props?.placeholder?.[slotIdx] ?? null

      return {
        char,
        placeholderChar,
        isActive,
        hasFakeCaret: isActive && char === null,
      }
    }),
    isFocused,
    isHovering: !props.disabled && isHoveringInput.value,
  }
})

provide(PublicVueOTPContextKey, contextValue)

// reka-ui forwardRef
defineExpose(Object.defineProperty({}, '$el', {
  enumerable: true,
  configurable: true,
  get: () => inputRef,
}))
</script>

<template>
  <NoSciptCssFallback v-if="noScriptCssFallback !== null" :fallback="noScriptCssFallback" />

  <div
    ref="containerRef"
    data-input-otp-container
    :style="rootStyle"
    :class="containerClass"
  >
    <slot :slots="contextValue.slots" :is-focused="isFocused" :is-hovering="!disabled && isHoveringInput" />
    <div style="position: absolute; inset: 0; pointer-events: none;">
      <input
        ref="inputRef"
        :value="internalValue"
        data-input-otp
        :data-input-otp-placeholder-shown="internalValue.length === 0 || undefined"
        :data-input-otp-mss="mirrorSelectionStart"
        :data-input-otp-mse="mirrorSelectionEnd"
        :aria-placeholder="placeholder"
        :style="inputStyle"
        :pattern="regexp?.source"
        v-bind="{ ...$attrs, ...inputProps }"
        @beforeinput="_beforeInputListener"
        @mouseover="(e) => {
          isHoveringInput = true
          emit('mouseover', e)
        }"
        @mouseleave="(e) => {
          isHoveringInput = false
          emit('mouseleave', e)
        }"
        @paste="(e) => {
          _pasteListener(e)
          emit('paste', e)
        }"
        @input="_inputListener"
        @focus="(e) => {
          _focusListener()
          emit('focus', e)
        }"
        @blur="(e) => {
          isFocused = false
          emit('blur', e)
        }"
      >
    </div>
  </div>
</template>
