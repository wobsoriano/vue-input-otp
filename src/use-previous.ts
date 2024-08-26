import type { DeepReadonly, Ref, UnwrapNestedRefs } from 'vue'
import { readonly, shallowRef, watch } from 'vue'

export function usePrevious<T>(value: Ref<T>, initialValue?: T) {
  const previous = shallowRef<T | undefined>(initialValue)

  watch(value, (_, oldValue) => {
    previous.value = oldValue
  }, { flush: 'sync' })

  return readonly(previous) as DeepReadonly<UnwrapNestedRefs<Ref<T>>>
}
