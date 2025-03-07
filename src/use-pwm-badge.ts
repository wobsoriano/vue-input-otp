import type { Ref } from 'vue'
import { computed, ref, watchEffect } from 'vue'

export type PWMBadgeStrategy = 'increase-width' | 'ignore' | 'none'

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
  pushPasswordManagerStrategy: PWMBadgeStrategy
  isFocused: Ref<boolean>
}) {
  /**
   * Password managers have a badge
   *  and I'll use this state to push them
   *  outside the input
   */
  const hasPWMBadge = ref(false)
  const hasPWMBadgeSpace = ref(false)
  const done = ref(false)

  const willPushPWMBadge = computed(() => {
    if (pushPasswordManagerStrategy === 'none') {
      return false
    }

    const increaseWidthCase
      = (pushPasswordManagerStrategy === 'increase-width'
      // @ts-expect-error: TODO: remove 'experimental-no-flickering' support in 2.0.0
      || pushPasswordManagerStrategy === 'experimental-no-flickering')
      && hasPWMBadge
      && hasPWMBadgeSpace

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

    // Get the top right-center point of the container.
    // That is usually where most password managers place their badge.
    const rightCornerX
      = elementToCompare.getBoundingClientRect().left
      + elementToCompare.offsetWidth
    const centereredY
      = elementToCompare.getBoundingClientRect().top
      + elementToCompare.offsetHeight / 2
    const x = rightCornerX - PWM_BADGE_MARGIN_RIGHT
    const y = centereredY

    // Do an extra search to check for famous password managers
    const pmws = document.querySelectorAll(PASSWORD_MANAGERS_SELECTORS)

    // If no password manager is automatically detect,
    // we'll try to dispatch document.elementFromPoint
    // to identify badges
    if (pmws.length === 0) {
      const maybeBadgeEl = document.elementFromPoint(x, y)

      // If the found element is the input itself,
      // then we assume it's not a password manager badge.
      // We are not sure. Most times that means there isn't a badge.
      if (maybeBadgeEl === container) {
        return
      }
    }

    hasPWMBadge.value = true
    done.value = true
  }

  watchEffect((onCleanup) => {
    if (!containerRef.value || pushPasswordManagerStrategy === 'none') {
      return
    }

    // Check if the PWM area is 100% visible
    function checkHasSpace() {
      const viewportWidth = window.innerWidth
      const distanceToRightEdge
        = viewportWidth - containerRef.value!.getBoundingClientRect().right
      hasPWMBadgeSpace.value = distanceToRightEdge >= PWM_BADGE_SPACE_WIDTH_PX
    }

    checkHasSpace()
    const interval = setInterval(checkHasSpace, 1000)

    onCleanup(() => {
      clearInterval(interval)
    })
  })

  watchEffect((onCleanup) => {
    const _isFocused = isFocused.value || document.activeElement === inputRef.value

    if (pushPasswordManagerStrategy === 'none' || !_isFocused) {
      return
    }
    const t1 = setTimeout(trackPWMBadge, 0)
    const t2 = setTimeout(trackPWMBadge, 2000)
    const t3 = setTimeout(trackPWMBadge, 5000)
    const t4 = setTimeout(() => {
      done.value = true
    }, 6000)

    onCleanup(() => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    })
  })

  return { hasPWMBadge, willPushPWMBadge, PWM_BADGE_SPACE_WIDTH }
}
