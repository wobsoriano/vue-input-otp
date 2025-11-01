import type { ComputedRef, InjectionKey } from 'vue'
import type { RenderProps } from './types'

export const PublicVueOTPContextKey: InjectionKey<ComputedRef<RenderProps>> = Symbol('vue-otp-context')
