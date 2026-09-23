/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 anchor 相关实现。

import type { NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { AnchorApi, AnchorSchema } from './anchor.types'
import { createPressTracker, dataAttr, ITEM_VALUE_ATTR } from '@xihan-ui/core'
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
  // 按压通道：真源是机器 context 里「正被按住的那一条」（按 value 记），每条链接各自合成一份跟踪器；
  // Space / Enter 与触屏按住投影 data-pressed，指针按住由 :active 表出，家族配方两者同一档
  const pressedValue = context.get('pressedValue')
  const press = (target: string): PressHandlers => createPressTracker({
    isPressed: () => context.get('pressedValue') === target,
    onChange: down => send(down ? { type: 'PRESS.START', value: target } : { type: 'PRESS.END', value: target }),
  })

  return {
    value,
    isActive,
    setValue: next => send({ type: 'VALUE.SET', value: next }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'aria-label': label,
      'data-orientation': orientation,
      'data-tone': prop('tone'),
      'data-size': prop('size'),
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
      const handlers = press(link.value)
      return normalize.element({
        ...parts.link.attrs,
        // 观察器与指示条量测都以此为条目身份
        [ITEM_VALUE_ATTR]: link.value,
        'href': `#${link.value}`,
        // 页内位置用 location 而非 page
        'aria-current': active ? 'location' : undefined,
        'data-current': dataAttr(active),
        // 链接归 Collection Item 导航当前：面、字色、字重与按压时间线由家族按 nav 语境给，
        // 当前节读 data-current；2px 指示条仍是 list 上的滑动 indicator 部件
        'data-xh-collection-item': '',
        'data-xh-collection-size': prop('size') ?? 'md',
        'data-xh-collection-context': 'nav',
        // Space / Enter 与触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active；与激活项互相独立
        'data-pressed': dataAttr(pressedValue === link.value),
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
        'onKeyDown': handlers.onKeyDown,
        'onKeyUp': handlers.onKeyUp,
        'onBlur': handlers.onBlur,
        'onPointerDown': handlers.onPointerDown,
        'onPointerUp': handlers.onPointerUp,
        'onPointerCancel': handlers.onPointerCancel,
      })
    },

    getLinkTextProps: () => normalize.element({
      ...parts['link-text'].attrs,
      'data-xh-collection-slot': 'text',
    }),

    // 指示条位置铺成内联样式
    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      'aria-hidden': true,
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
