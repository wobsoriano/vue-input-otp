// TODO: Can't import Input Attributes from Vue
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
  modelValue?: string
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
