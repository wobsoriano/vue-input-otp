import { inject } from 'vue'
import { PublicVueOTPContextKey } from './symbols'

export function useVueOTPContext() {
  return inject(PublicVueOTPContextKey)
}
