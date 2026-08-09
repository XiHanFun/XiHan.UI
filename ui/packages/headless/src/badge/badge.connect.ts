import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { BadgeApi, BadgeProps } from './badge.types'
import { badgeAnatomy } from './badge.anatomy'

const parts = badgeAnatomy.build()

// Badge 无状态机，外观由 variant 决定。
export function connectBadge<T extends PropTypes>(
  props: BadgeProps,
  normalize: NormalizeProps<T>,
): BadgeApi<T> {
  return {
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-variant': props.variant,
      'data-tone': props.tone,
      'data-size': props.size,
    }),
  }
}
