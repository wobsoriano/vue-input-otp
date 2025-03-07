<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, onMounted, onUnmounted, ref, useAttrs, watch, watchEffect } from 'vue'
import type { Metadata, OTPInputEmits, OTPInputProps, SlotProps } from './types'
import { SelectionType } from './types'
import { REGEXP_ONLY_DIGITS } from './regexp'
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
})

const emit = defineEmits<OTPInputEmits>()

const internalValue = defineModel({ default: '' })

const regexp = computed(() => props.pattern
  ? typeof props.pattern === 'string'
    ? new RegExp(props.pattern)
    : props.pattern
  : null)

/** Mirrors for UI rendering purpose only */
const isHoveringInput = ref(false)
const isFocused = ref(false)
const mirrorSelectionStart = ref<number | null>(null)
const mirrorSelectionEnd = ref<number | null>(null)

const inputRef = ref<HTMLInputElement & { __metadata__?: Metadata } | null>(null)

const containerRef = ref<HTMLDivElement | null>(null)

const pwmb = usePasswordManagerBadge({
  containerRef,
  inputRef,
  pushPasswordManagerStrategy: props.pushPasswordManagerStrategy,
  isFocused,
})

const maxLength = computed(() => Number(props.maxlength))

function safeInsertRule(sheet: CSSStyleSheet, rule: string) {
  try {
    sheet.insertRule(rule)
  }
  catch {
    console.error('input-otp could not insert CSS rule:', rule)
  }
}

onMounted(() => {
  const el = inputRef.value

  if (!el)
    return el

  const _select = el.select.bind(el)
  el.select = () => {
    _select()
    // Workaround proxy to update UI as native `.select()` does not trigger focus event
    mirrorSelectionStart.value = 0
    mirrorSelectionEnd.value = el.value.length
  }

  const styleEl = document.createElement('style')
  styleEl.id = 'input-otp-style'
  document.head.appendChild(styleEl)
  const styleSheet = styleEl.sheet
  if (styleSheet) {
    safeInsertRule(styleSheet, '[data-input-otp]::selection { background: transparent !important; }')
    // Add NoScript CSS fallback
    safeInsertRule(styleSheet, 'noscript [data-input-otp] { color: inherit !important; letter-spacing: normal !important; }')
    safeInsertRule(styleSheet, '@media (prefers-color-scheme: dark) { noscript [data-input-otp] { color: #fff !important; } }')
  }

  const updateRootHeight = () => {
    if (el)
      el.style.setProperty('--root-height', `${el.clientHeight}px`)
  }
  updateRootHeight()
  const resizeObserver = new ResizeObserver(updateRootHeight)
  resizeObserver.observe(el)

  setTimeout(() => {
    mirrorSelectionStart.value = el.selectionStart
    mirrorSelectionEnd.value = el.selectionEnd
    isFocused.value = document.activeElement === el
  }, 20)

  onUnmounted(() => {
    resizeObserver.disconnect()
  })
})

watch([() => maxLength.value, internalValue], ([maxlength, value], [_, previousValue]) => {
  if (value !== previousValue && value.length === maxlength)
    emit('complete', value)
}, { immediate: true })

// Run improved selection tracking while focused
watchEffect((onInvalidate) => {
  if (!isFocused.value)
    return

  const interval = setInterval(() => {
    if (inputRef.value && document.activeElement === inputRef.value) {
      mirrorSelectionStart.value = inputRef.value.selectionStart
      mirrorSelectionEnd.value = inputRef.value.selectionEnd
    }
  }, 50)

  onInvalidate(() => {
    clearInterval(interval)
  })
})

function _selectListener() {
  if (!inputRef.value)
    return

  const _start = inputRef.value.selectionStart
  const _end = inputRef.value.selectionEnd
  const isSelected = _start !== null && _end !== null

  if (internalValue.value.length !== 0 && isSelected) {
    const isSingleCaret = _start === _end
    const isInsertMode = _start === internalValue.value.length && internalValue.value.length < Number(props.maxlength)

    if (isSingleCaret && !isInsertMode) {
      const caretPos = _start

      let start: number = -1
      let end: number = -1

      if (caretPos === 0) {
        start = 0
        end = 1
      }
      else if (caretPos === internalValue.value.length) {
        start = internalValue.value.length - 1
        end = internalValue.value.length
      }
      else {
        start = caretPos
        end = caretPos + 1
      }

      if (start !== -1 && end !== -1)
        inputRef.value.setSelectionRange(start, end)
    }
  }

  syncTimeouts(() => {
    mirrorSelectionStart.value = inputRef.value?.selectionStart ?? null
    mirrorSelectionEnd.value = inputRef.value?.selectionEnd ?? null
  })
}

function _inputListener(e: Event) {
  syncTimeouts(_selectListener)

  const newValue = (e.currentTarget as HTMLInputElement).value.slice(0, maxLength.value)

  if (newValue.length > 0 && regexp.value && !regexp.value.test(newValue)) {
    e.preventDefault()
    return
  }

  internalValue.value = newValue
  emit('input', e)
}

// Fix iOS pasting
function _pasteListener(e: ClipboardEvent) {
  const content = e.clipboardData?.getData('text/plain')
  e.preventDefault()

  const start = inputRef.value?.selectionStart ?? 0
  const end = inputRef.value?.selectionEnd ?? 0

  const isReplacing = start !== end

  const newValueUncapped = isReplacing
    ? internalValue.value.slice(0, start) + (content ?? '') + internalValue.value.slice(end) // Replacing
    : internalValue.value.slice(0, start) + (content ?? '') + internalValue.value.slice(start) // Inserting
  const newValue = newValueUncapped.slice(0, maxLength.value)

  if (newValue.length > 0 && regexp.value && !regexp.value.test(newValue))
    return

  internalValue.value = newValue
  emit('input', e)

  const _start = Math.min(newValue.length, maxLength.value - 1)
  const _end = newValue.length
  inputRef.value?.setSelectionRange(_start, _end)
  mirrorSelectionStart.value = _start
  mirrorSelectionEnd.value = _end
}

function _keyDownListener(e: KeyboardEvent) {
  if (!inputRef.value)
    return

  const inputSel = [
    inputRef.value.selectionStart,
    inputRef.value.selectionEnd,
  ]
  if (inputSel[0] === null || inputSel[1] === null)
    return

  let selectionType: SelectionType
  if (inputSel[0] === inputSel[1])
    selectionType = SelectionType.CARET
  else if (inputSel[1] - inputSel[0] === 1)
    selectionType = SelectionType.CHAR
  else if (inputSel[1] - inputSel[0] > 1)
    selectionType = SelectionType.MULTI
  else
    throw new Error('Could not determine OTPInput selection type')

  if (
    e.key === 'ArrowLeft'
    || e.key === 'ArrowRight'
    || e.key === 'ArrowUp'
    || e.key === 'ArrowDown'
    || e.key === 'Home'
    || e.key === 'End'
  ) {
    if (
      e.key === 'ArrowLeft'
      && selectionType === SelectionType.CHAR
      && !e.shiftKey
      && !e.metaKey
      && !e.ctrlKey
      && !e.altKey
    ) {
      e.preventDefault()

      const start = Math.max(inputSel[0] - 1, 0)
      const end = Math.max(inputSel[1] - 1, 1)

      inputRef.value.setSelectionRange(start, end)
    }

    if (
      e.altKey
      && !e.shiftKey
      && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')
    ) {
      e.preventDefault()

      if (e.key === 'ArrowLeft')
        inputRef.value.setSelectionRange(0, Math.min(1, internalValue.value.length))

      if (e.key === 'ArrowRight') {
        inputRef.value.setSelectionRange(
          Math.max(0, internalValue.value.length - 1),
          internalValue.value.length,
        )
      }
    }
  }
}

function onContainerClick(e: MouseEvent) {
  e.preventDefault()
  if (!inputRef.value)
    return

  inputRef.value.focus()
}

function onTouch(e: TouchEvent) {
  const isFocusing = document.activeElement === e.currentTarget
  if (isFocusing) {
    setTimeout(() => {
      _selectListener()
    }, 50)
  }

  emit('touchend', e)
}

function onDoubleClick(e: MouseEvent) {
  const lastClickTimestamp = inputRef.value?.__metadata__?.lastClickTimestamp

  const isFocusing = document.activeElement === e.currentTarget
  if (
    lastClickTimestamp !== undefined
    && isFocusing
    && Date.now() - lastClickTimestamp <= 300 // Fast enough click
  ) {
    const currentTarget = e.currentTarget as HTMLInputElement
    currentTarget.setSelectionRange(0, currentTarget.value.length)
    syncTimeouts(_selectListener)
  }

  emit('dblclick', e)
}

function onFocus(e: FocusEvent) {
  const input = inputRef.value
  if (input) {
    const start = Math.min(input.value.length, maxLength.value - 1)
    const end = input.value.length
    input.setSelectionRange(start, end)
    mirrorSelectionStart.value = start
    mirrorSelectionEnd.value = end
  }
  isFocused.value = true

  emit('focus', e)
}

const slots = computed<SlotProps[]>(() => {
  return Array.from({ length: maxLength.value }).map((_, slotIdx) => {
    const isActive
      = isFocused.value
      && mirrorSelectionStart.value !== null
      && mirrorSelectionEnd.value !== null
      && ((mirrorSelectionStart.value === mirrorSelectionEnd.value
      && slotIdx === mirrorSelectionStart.value)
      || (slotIdx >= mirrorSelectionStart.value && slotIdx < mirrorSelectionEnd.value))

    const char = internalValue.value[slotIdx] !== undefined ? internalValue.value[slotIdx] : null
    const placeholderChar = char === null ? props.placeholder?.[slotIdx] ?? null : null

    return {
      char,
      isActive,
      hasFakeCaret: isActive && char === null,
      placeholder: placeholderChar,
    }
  })
})

const attrs = useAttrs()
const inputProps = computed(() => {
  const { containerClass, placeholder, pushPasswordManagerStrategy, ...rest } = props
  return {
    ...attrs,
    ...rest,
    pattern: regexp.value?.source,
  }
})

const inputStyle = computed(() => ({
  position: 'absolute',
  inset: 0,
  width: pwmb.willPushPWMBadge
    ? `calc(100% + ${pwmb.PWM_BADGE_SPACE_WIDTH})`
    : '100%',
  clipPath: pwmb.willPushPWMBadge
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
  lineHeight: '1',
  letterSpacing: '-.5em',
  fontSize: 'var(--root-height)',
  fontFamily: 'monospace',
  fontVariantNumeric: 'tabular-nums',
} satisfies CSSProperties))

defineExpose({
  ref: inputRef,
})
</script>

<template>
  <div
    ref="containerRef"
    data-input-otp-container
    style="position: relative; user-select: none; -webkit-user-select: none;"
    :style="{ cursor: disabled ? 'default' : 'text' }"
    :class="containerClass"
    @mouseover="(e) => {
      isHoveringInput = true
      emit('mouseover', e)
    }"
    @mouseleave="(e) => {
      isHoveringInput = true
      emit('mouseleave', e)
    }"
    @mousedown="(e) => {
      if (!disabled) {
        onContainerClick(e)
      }

      emit('mousedown', e)
    }"
  >
    <slot :slots="slots" :is-focused="isFocused" :is-hovering="!disabled && isHoveringInput" />

    <input
      ref="inputRef"
      :value="internalValue"
      data-input-otp
      :style="inputStyle"
      v-bind="inputProps"
      @select="(e) => {
        _selectListener()
        emit('select', e)
      }"
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
      @touchend="onTouch"
      @touchmove="onTouch"
      @click="(e) => {
        inputRef!.__metadata__ = Object.assign(
          {},
          inputRef?.__metadata__,
          { lastClickTimestamp: Date.now() },
        )

        emit('click', e)
      }"
      @dblclick="onDoubleClick"
      @change="(e) => {
        syncTimeouts(_selectListener)

        emit('change', e)
      }"
      @input="_inputListener"
      @keydown="(e) => {
        _keyDownListener(e)
        syncTimeouts(_selectListener)

        emit('keydown', e)
      }"
      @keyup="(e) => {
        syncTimeouts(_selectListener)

        emit('keyup', e)
      }"
      @focus="onFocus"
      @blur="(e) => {
        isFocused = false

        emit('blur', e)
      }"
    >
  </div>
</template>
