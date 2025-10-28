import type { Ref } from 'vue'
import type { OTPInputProps } from './types'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const PWM_BADGE_MARGIN_RIGHT = 18
const PWM_BADGE_SPACE_WIDTH_PX = 40
const PWM_BADGE_SPACE_WIDTH = `${PWM_BADGE_SPACE_WIDTH_PX}px`

const PASSWORD_MANAGERS_SELECTORS = [
  '[data-lastpass-icon-root]', // LastPass
  'com-1password-button', // 1Password
  '[data-dashlanecreated]', // Dashlane
  '[style$="2147483647 !important;"]', // Bitwarden
].join(',')

export function usePasswordManagerBadge({
  containerRef,
  inputRef,
  pushPasswordManagerStrategy,
  isFocused,
}: {
  containerRef: Ref<HTMLDivElement | null>
  inputRef: Ref<HTMLInputElement | null>
  pushPasswordManagerStrategy: OTPInputProps['pushPasswordManagerStrategy']
  isFocused: Ref<boolean>
}) {
  const pwmMetadata = ref({
    done: false,
    refocused: false,
  })

  const hasPWMBadge = ref(false)
  const hasPWMBadgeSpace = ref(false)
  const done = ref(false)

  const willPushPWMBadge = computed(() => {
    if (pushPasswordManagerStrategy === 'none') {
      return false
    }

    const increaseWidthCase
      = (pushPasswordManagerStrategy === 'increase-width'
        || pushPasswordManagerStrategy === 'experimental-no-flickering')
      && hasPWMBadge.value
      && hasPWMBadgeSpace.value

    return increaseWidthCase
  })

  const trackPWMBadge = () => {
    const container = containerRef.value
    const input = inputRef.value
    if (
      !container
      || !input
      || done.value
      || pushPasswordManagerStrategy === 'none'
    ) {
      return
    }

    const elementToCompare = container

    const rightCornerX
      = elementToCompare.getBoundingClientRect().left
        + elementToCompare.offsetWidth
    const centereredY
      = elementToCompare.getBoundingClientRect().top
        + elementToCompare.offsetHeight / 2
    const x = rightCornerX - PWM_BADGE_MARGIN_RIGHT
    const y = centereredY

    const pmws = document.querySelectorAll(PASSWORD_MANAGERS_SELECTORS)

    if (pmws.length === 0) {
      const maybeBadgeEl = document.elementFromPoint(x, y)

      if (maybeBadgeEl === container) {
        return
      }
    }

    hasPWMBadge.value = true
    done.value = true

    if (!pwmMetadata.value.refocused && document.activeElement === input) {
      const sel = [input.selectionStart, input.selectionEnd]
      input.blur()
      input.focus()
      input.setSelectionRange(sel[0]!, sel[1]!)

      pwmMetadata.value.refocused = true
    }
  }

  const checkHasSpace = () => {
    const container = containerRef.value
    if (!container || pushPasswordManagerStrategy === 'none') {
      return
    }

    const viewportWidth = window.innerWidth
    const distanceToRightEdge
      = viewportWidth - container.getBoundingClientRect().right
    hasPWMBadgeSpace.value = distanceToRightEdge >= PWM_BADGE_SPACE_WIDTH_PX
  }

  let spaceInterval: number

  onMounted(() => {
    checkHasSpace()
    spaceInterval = setInterval(checkHasSpace, 1000)
  })

  onUnmounted(() => {
    clearInterval(spaceInterval)
  })

  watch([isFocused, inputRef], (newValues, _, onInvalidate) => {
    const [newIsFocused, newInputRef] = newValues
    const _isFocused = newIsFocused || document.activeElement === newInputRef

    if (pushPasswordManagerStrategy === 'none' || !_isFocused) {
      return
    }

    const t1 = setTimeout(trackPWMBadge, 0)
    const t2 = setTimeout(trackPWMBadge, 2000)
    const t3 = setTimeout(trackPWMBadge, 5000)
    const t4 = setTimeout(() => {
      done.value = true
    }, 6000)

    onInvalidate(() => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    })
  })

  return { hasPWMBadge, willPushPWMBadge, PWM_BADGE_SPACE_WIDTH }
}
