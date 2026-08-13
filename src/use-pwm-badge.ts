import type { Ref } from 'vue'
import type { OTPInputProps } from './types'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const PWM_BADGE_MARGIN_RIGHT = 18
const PWM_BADGE_SPACE_WIDTH_PX = 40
const PWM_BADGE_SPACE_WIDTH = `${PWM_BADGE_SPACE_WIDTH_PX}px`

/**
 * Free space, in px, to the right of the container. The push strategy grows
 * the input past the container, so the gutter has to fit inside the nearest
 * box constraining horizontal overflow or the overhang becomes a scrollbar.
 */
function availableBadgeSpace(container: HTMLElement): number {
  const containerRight = container.getBoundingClientRect().right

  // The container counts too, since its own overflow clips the input inside it
  let el: HTMLElement | null = container
  while (el) {
    if (getComputedStyle(el).overflowX !== 'visible') {
      const rect = el.getBoundingClientRect()
      return rect.left + el.clientLeft + el.clientWidth - containerRight
    }
    el = el.parentElement
  }

  // Unlike `window.innerWidth`, `clientWidth` excludes a vertical scrollbar
  return document.documentElement.clientWidth - containerRight
}

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

    // The interval's copy can be up to a second stale, so re-measure here
    hasPWMBadgeSpace.value
      = availableBadgeSpace(container) >= PWM_BADGE_SPACE_WIDTH_PX
    hasPWMBadge.value = true
    done.value = true
  }

  const checkHasSpace = () => {
    const container = containerRef.value
    if (!container || pushPasswordManagerStrategy === 'none') {
      return
    }

    // Check if the badge gutter fits without overflowing or being clipped
    hasPWMBadgeSpace.value
      = availableBadgeSpace(container) >= PWM_BADGE_SPACE_WIDTH_PX
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
