<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useAttrs, watch } from 'vue'
import type { Metadata, OTPInputProps } from './types'
import { SelectionType } from './types'
import { REGEXP_ONLY_DIGITS } from './regexp'
import { syncTimeouts } from './sync-timeouts'

defineOptions({
  name: 'OTPInput',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<OTPInputProps>(), {
  pattern: REGEXP_ONLY_DIGITS,
  inputmode: 'numeric',
  allowNavigation: true,
  modelValue: '',
})

const emit = defineEmits<{
  (event: 'complete', value: string): void
  (event: 'change', e: Event): void
  (event: 'select', e: Event): void
  (event: 'input', e: Event): void
  (event: 'keydown', e: KeyboardEvent): void
  (event: 'keyup', e: KeyboardEvent): void
  (event: 'focus', e: FocusEvent): void
  (event: 'blur', e: FocusEvent): void
  (event: 'mouseover', e: MouseEvent): void
  (event: 'mouseleave', e: MouseEvent): void
  (event: 'mousedown', e: MouseEvent): void
  (event: 'paste', e: ClipboardEvent): void
  (event: 'touchend', e: TouchEvent): void
  (event: 'touchmove', e: TouchEvent): void
  (event: 'click', e: MouseEvent): void
  (event: 'dblclick', e: MouseEvent): void
}>()

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

defineExpose({
  ref: inputRef,
})

function mutateInputRefAndReturn() {
  const el = inputRef.value

  if (!el)
    return el

  const _select = el.select.bind(el)
  el.select = () => {
    if (!props.allowNavigation) {
      // Cannot select all chars as navigation is disabled
      return
    }

    _select()
    // Workaround proxy to update UI as native `.select()` does not trigger focus event
    mirrorSelectionStart.value = 0
    mirrorSelectionEnd.value = el.value.length
  }

  return el
}

onMounted(() => {
  const el = mutateInputRefAndReturn()!

  const styleEl = document.createElement('style')
  document.head.appendChild(styleEl)
  const styleSheet = styleEl.sheet
  styleSheet?.insertRule(
    '[data-input-otp]::selection { background: transparent !important; }',
  )

  const updateRootHeight = () => {
    if (el)
      el.style.setProperty('--root-height', `${el.clientHeight}px`)
  }
  updateRootHeight()
  const resizeObserver = new ResizeObserver(updateRootHeight)
  resizeObserver.observe(el)

  _selectListener()
  setTimeout(() => {
    isFocused.value = document.activeElement === inputRef.value
  }, 20)

  onUnmounted(() => {
    resizeObserver.disconnect()
    document.head.removeChild(styleEl)
  })
})
watch([() => props.maxlength, internalValue], ([maxlength, value], [_, previousValue]) => {
  if (!previousValue)
    return

  if (
    value !== previousValue
    && maxlength
    && previousValue.length < maxlength
    && value
    && value.length === maxlength
  )
    emit('complete', value)
}, { immediate: true })

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

  const newValue = (e.currentTarget as HTMLInputElement).value.slice(0, props.maxlength)

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

  const start = inputRef.value?.selectionStart!
  const end = inputRef.value?.selectionEnd!

  const isReplacing = start !== end

  const newValueUncapped = isReplacing
    ? internalValue.value.slice(0, start) + content + internalValue.value.slice(end) // Replacing
    : internalValue.value.slice(0, start) + content + internalValue.value.slice(start) // Inserting
  const newValue = newValueUncapped.slice(0, props.maxlength)

  if (newValue.length > 0 && regexp.value && !regexp.value.test(newValue))
    return

  internalValue.value = newValue
  emit('input', e)

  const _start = Math.min(newValue.length, props.maxlength - 1)
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
    if (!props.allowNavigation) {
      e.preventDefault()
    }
    else {
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

const slots = computed(() => {
  return Array.from({ length: Number(props.maxlength) }).map((_, slotIdx) => {
    const isActive
      = isFocused.value
      && mirrorSelectionStart.value !== null
      && mirrorSelectionEnd.value !== null
      && ((mirrorSelectionStart.value === mirrorSelectionEnd.value
      && slotIdx === mirrorSelectionStart.value)
      || (slotIdx >= mirrorSelectionStart.value && slotIdx < mirrorSelectionEnd.value))

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
  const { containerClass, value, modelValue, allowNavigation, ...rest } = props
  return {
    ...attrs, // putting attrs for now until I can extract the input props from Vue
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
      :style="{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
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
      }"
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
      @focus="(e) => {
        if (inputRef) {
          const start = Math.min(inputRef.value.length, maxlength - 1)
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
    >
  </div>
</template>
