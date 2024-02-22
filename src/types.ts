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

export interface OTPInputProps extends InputHTMLAttributes {
  maxlength: number
  allowNavigation?: boolean
  inputmode?: 'numeric' | 'text'
  containerClass?: string
}

export enum SelectionType {
  CARET = 0,
  CHAR = 1,
  MULTI = 2,
}

export interface Metadata {
  lastClickTimestamp: number
}

export interface SlotProps {
  isActive: boolean
  char: string | null
  hasFakeCaret: boolean
}

export interface RenderProps {
  slots: SlotProps[]
  isFocused: boolean
  isHovering: boolean
}
