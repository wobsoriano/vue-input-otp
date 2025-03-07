import type { PWMBadgeStrategy } from './use-pwm-badge'

// Need to figure out how to import this from Vue without causing "Failed to resolve extends base type" error
export interface InputHTMLAttributes {
  accept?: string
  alt?: string
  autocomplete?: string
  autofocus?: boolean
  capture?: boolean | 'user' | 'environment'
  checked?: boolean | any[] | Set<any>
  crossorigin?: string
  disabled?: boolean
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'
  form?: string
  formaction?: string
  formenctype?: string
  formmethod?: string
  formnovalidate?: boolean
  formtarget?: string
  height?: number
  indeterminate?: boolean
  list?: string
  max?: number
  maxlength?: number
  min?: number
  minlength?: number
  multiple?: boolean
  name?: string
  pattern?: string
  placeholder?: string
  readonly?: boolean
  required?: boolean
  size?: number
  src?: string
  step?: number
  type?: string
  value?: any
  width?: number
}

export interface OTPInputProps {
  maxlength: number
  pattern?: string | RegExp
  inputmode?: 'text' | 'numeric' | 'decimal' | 'tel'
  autocomplete?: string
  textAlign?: 'left' | 'center' | 'right'
  containerClass?: string
  disabled?: boolean
  placeholder?: string
  pushPasswordManagerStrategy?: PWMBadgeStrategy
}

export interface OTPInputEmits {
  (e: 'input', event: Event): void
  (e: 'change', event: Event): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'click', event: MouseEvent): void
  (e: 'dblclick', event: MouseEvent): void
  (e: 'mouseover', event: MouseEvent): void
  (e: 'mouseleave', event: MouseEvent): void
  (e: 'mousedown', event: MouseEvent): void
  (e: 'keydown', event: KeyboardEvent): void
  (e: 'keyup', event: KeyboardEvent): void
  (e: 'paste', event: ClipboardEvent): void
  (e: 'select', event: Event): void
  (e: 'touchend', event: TouchEvent): void
  (e: 'complete', value: string): void
}

export enum SelectionType {
  CARET = 'CARET',
  CHAR = 'CHAR',
  MULTI = 'MULTI',
}

export interface Metadata {
  lastClickTimestamp?: number
}

export interface SlotProps {
  char: string | null
  isActive: boolean
  hasFakeCaret: boolean
  placeholder?: string | null
}

export interface RenderProps {
  slots: SlotProps[]
  isFocused: boolean
  isHovering: boolean
}
