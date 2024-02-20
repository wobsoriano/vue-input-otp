<script setup lang="ts">
import { ref, computed, watch, useAttrs } from 'vue'
import type { OTPInputProps } from './types'
import { SelectionType } from './types'
import { REGEXP_ONLY_DIGITS } from './regexp';
import { syncTimeouts } from './sync-timeouts';

const internalValue = defineModel({ default: '' })

defineOptions({
  name: 'Input',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<OTPInputProps>(), {
  inputmode: 'numeric',
  pattern: REGEXP_ONLY_DIGITS,
  allowNavigation: true,
  autofocus: false,
})

const emit = defineEmits([
  'complete',
  'change',
  'input',
  'keydown',
  'keyup',
  'focus',
  'blur',
  'mouseover',
  'mouseleave',
  'mousedown'
])

// Workarounds
const regexp = computed(() => props.pattern
  ? typeof props.pattern === 'string'
    ? new RegExp(props.pattern)
    : props.pattern
  : null)

const inputRef = ref<HTMLInputElement | null>(null)

/** Mirrors for UI rendering purpose only */
const isHoveringContainer = ref(false)
const isFocused = ref(false)
const mirrorSelectionStart = ref<number | null>(null)
const mirrorSelectionEnd = ref<number | null>(null)

watch([() => props.maxlength, internalValue], ([maxlength, value], [_, previousValue]) => {
  if (!previousValue) {
    return
  }
  
  if (
    value !== previousValue &&
    maxlength &&
    previousValue.length < maxlength &&
    value && 
    value.length === maxlength
  ) {
    emit('complete', value)
  }
}, { immediate: true })

function _selectListener() {
  if (!inputRef.value) {
    return
  }

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
      } else if (caretPos === internalValue.value.length) {
        start = internalValue.value.length - 1
        end = internalValue.value.length
      } else {
        start = caretPos
        end = caretPos + 1
      }

      if (start !== -1 && end !== -1) {
        inputRef.value.setSelectionRange(start, end)
      }
    }
  }

  syncTimeouts(() => {
    mirrorSelectionStart.value = inputRef.value?.selectionStart ?? null
    mirrorSelectionEnd.value = inputRef.value?.selectionEnd ?? null
  })
}

function _changeListener(e: Event) {
  if (
    (e.currentTarget as any).value.length > 0 &&
    regexp.value &&
    !regexp.value.test((e.currentTarget as any).value)
  ) {
    e.preventDefault()
    return
  }

  emit('change', (e.currentTarget as any).value)
}

function _keyDownListener(e: KeyboardEvent) {
  if (!inputRef.value) {
    return
  }

  const inputSel = [
    inputRef.value.selectionStart,
    inputRef.value.selectionEnd,
  ]
  if (inputSel[0] === null || inputSel[1] === null) {
    return
  }

  let selectionType: SelectionType
  if (inputSel[0] === inputSel[1]) {
    selectionType = SelectionType.CARET
  } else if (inputSel[1] - inputSel[0] === 1) {
    selectionType = SelectionType.CHAR
  } else if (inputSel[1] - inputSel[0] > 1) {
    selectionType = SelectionType.MULTI
  } else {
    throw new Error('Could not determine OTPInput selection type')
  }

  if (
    e.key === 'ArrowLeft' ||
    e.key === 'ArrowRight' ||
    e.key === 'ArrowUp' ||
    e.key === 'ArrowDown' ||
    e.key === 'Home' ||
    e.key === 'End'
  ) {
    if (!props.allowNavigation) {
      e.preventDefault()
    } else {
      if (
        e.key === 'ArrowLeft' &&
        selectionType === SelectionType.CHAR &&
        !e.shiftKey &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault()

        const start = Math.max(inputSel[0] - 1, 0)
        const end = Math.max(inputSel[1] - 1, 1)

        inputRef.value.setSelectionRange(start, end)
      }

      if (
        e.altKey &&
        !e.shiftKey &&
        (e.key === 'ArrowLeft' || e.key === 'ArrowRight')
      ) {
        e.preventDefault()

        if (e.key === 'ArrowLeft') {
          inputRef.value.setSelectionRange(0, Math.min(1, internalValue.value.length))
        }
        if (e.key === 'ArrowRight') {
          inputRef.value.setSelectionRange(
            Math.max(0, internalValue.value.length - 1),
            internalValue.value.length,
          )
        }
      }
    }
  }
}

function onContainerClick(e: MouseEvent) {
  e.preventDefault()
  if (!inputRef.value) {
    return
  }
  inputRef.value.focus()
}

const slots = computed(() => {
  return Array.from({ length: Number(props.maxlength) }).map((_, slotIdx) => {
    const isActive =
      isFocused.value &&
      mirrorSelectionStart.value !== null &&
      mirrorSelectionEnd.value !== null &&
      ((mirrorSelectionStart.value === mirrorSelectionEnd.value &&
        slotIdx === mirrorSelectionStart.value) ||
        (slotIdx >= mirrorSelectionStart.value && slotIdx < mirrorSelectionEnd.value))

    
    const char = internalValue.value[slotIdx] !== undefined ? internalValue.value[slotIdx] : null

    return {
      char,
      isActive,
      hasFakeCaret: isActive && char === null,
    }
  })
})

const attrs = useAttrs()
const inputProps = computed(() => {
  const { containerClass: _, ...rest } = props
  return {
    ...attrs,
    ...rest,
    autocomplete: props.autocomplete || 'one-time-code',
    pattern: regexp.value?.source,
  }
})
</script>

<template>
  <div
    style="position: relative; user-select: none; -webkit-user-select: none;"
    :style="{ cursor: disabled ? 'default' : 'text' }"
    :class="containerClass"
    @mouseover="(e) => {
      isHoveringContainer = true
      emit('mouseover', e)
    }"
    @mouseleave="(e) => {
      isHoveringContainer = true
      emit('mouseleave', e)
    }"
    @mousedown="(e) => {
      if (!disabled) {
        onContainerClick(e)
      }

      emit('mousedown', e)
    }"
  >
  <slot :slots="slots" :is-focused="isFocused" :is-hovering="!disabled && isHoveringContainer" />
    
  <input
    style="position: absolute; inset: 0; opacity: 0; pointer-events: none; outline: none !important;"
    @change="_changeListener"
    @select="_selectListener"
    v-model="internalValue"
    ref="inputRef"
    @input="(e) => {
      syncTimeouts(_selectListener)

      emit('input', e)
    }"
    @keydown="(e) => {
      _keyDownListener(e)
      syncTimeouts(_selectListener)

      emit('keydown', e)
    }"
    @keyup="(e) => {
      _keyDownListener(e)
      syncTimeouts(_selectListener)

      emit('keyup', e)
    }"
    @focus="(e) => {
      if (inputRef) {
        const start = Math.min(inputRef.value.length, maxlength! - 1)
        const end = inputRef.value.length
        inputRef.setSelectionRange(start, end)
        mirrorSelectionStart = start
        mirrorSelectionEnd = end
      }
      isFocused = true

      emit('focus', e)
    }"
    @blur="(e) => {
      isFocused = false

      emit('blur', e)
    }"
    v-bind="inputProps"
  />
  </div>
</template>
