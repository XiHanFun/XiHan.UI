import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { AnchorApi, AnchorSchema } from './anchor.types'
import { ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/core'
import { anchorAnatomy } from './anchor.anatomy'

const parts = anchorAnatomy.build()

export function connectAnchor<T extends PropTypes>(
  service: Service<AnchorSchema>,
  normalize: NormalizeProps<T>,
): AnchorApi<T> {
  const { context, prop, send } = service
  const value = context.get('value') ?? null
  const indicator = context.get('indicator')
  const orientation = prop('orientation') ?? 'vertical'
  const label = prop('translations')?.root ?? 'Anchor navigation'
  const smooth = !!prop('smooth')

  const isActive = (target: string): boolean => target === value

  return {
    value,
    isActive,
    setValue: next => send({ type: 'VALUE.SET', value: next }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'aria-label': label,
      'data-orientation': orientation,
      // 只在作者显式给了时才写：写死 ltr 会切断从 RTL 祖先继承来的方向
      'dir': prop('dir'),
    }),

    getListProps: () => normalize.element({
      ...parts.list.attrs,
      'data-orientation': orientation,
    }),

    getItemProps: () => normalize.element({
      ...parts.item.attrs,
    }),

    getLinkProps: (link) => {
      const active = isActive(link.value)
      return normalize.element({
        ...parts.link.attrs,
        // 观察器与指示条量测都以此为条目身份
        [ITEM_VALUE_ATTR]: link.value,
        'href': `#${link.value}`,
        // 页内位置用 location 而非 page
        'aria-current': active ? 'location' : undefined,
        'data-active': dataAttr(active),
        'onClick': (event: MouseEvent) => {
          // 作者自己的处理器已拦下就不抢
          if (event.defaultPrevented)
            return
          // 带修饰键或非主键的点击交回浏览器
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
            return
          // 平滑滚动由机器接管，拦下原生跳转
          if (smooth)
            event.preventDefault()
          send({ type: 'LINK.CLICK', value: link.value })
        },
      })
    },

    // 指示条位置铺成内联样式
    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      'aria-hidden': 'true',
      'data-orientation': orientation,
      'data-value': value ?? undefined,
      'hidden': indicator == null || undefined,
      // 只写主轴那一条
      'style': indicator
        ? (orientation === 'horizontal'
            ? { insetInlineStart: `${indicator.inlineStart}px`, inlineSize: `${indicator.inlineSize}px` }
            : { insetBlockStart: `${indicator.blockStart}px`, blockSize: `${indicator.blockSize}px` })
        : undefined,
    }),
  }
}
