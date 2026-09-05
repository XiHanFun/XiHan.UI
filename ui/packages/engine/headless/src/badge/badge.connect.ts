import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { BadgeApi, BadgeProps } from './badge.types'
import { dataAttr } from '@xihan-ui/core'
import { badgeAnatomy } from './badge.anatomy'

const parts = badgeAnatomy.build()

const DEFAULT_MAX = 99

// Badge 无状态机：显不显示、写什么数字，都是由 props 直接算出来的。
export function connectBadge<T extends PropTypes>(
  props: BadgeProps,
  normalize: NormalizeProps<T>,
): BadgeApi<T> {
  const { count, dot, showZero } = props
  const max = props.max ?? DEFAULT_MAX
  const placement = props.placement ?? 'top-end'

  // 没有未读就不该有角标；显式要求显示 0 的除外
  const visible = count == null || count !== 0 || !!showZero

  // 圆点模式只表示「有」，不表示「有几个」
  const text = dot || count == null ? '' : count > max ? `${max}+` : `${count}`

  return {
    visible,
    text,
    /**
     * 锚点。被标记的那个东西放进它里面——角标是挂在别的元素角上的一枚标记，
     * 不是一枚可以单独摆的药丸；行内的状态药丸请用 tag。
     */
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-placement': placement,
    }),

    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      'data-tone': props.tone,
      'data-size': props.size,
      'data-placement': placement,
      // 皮肤据此收成一个圆点：不留内边距、不出文字
      'data-dot': dataAttr(dot),
      // 算出来是空的就整枚收起，作者不必自己判
      'hidden': !visible || undefined,
      // 光念数字听不出这是什么，宿主给了整句就用整句
      'aria-label': props.label,
      // 角标报的是宿主的状态而不是自己
      'role': props.label ? 'status' : undefined,
    }),
  }
}
