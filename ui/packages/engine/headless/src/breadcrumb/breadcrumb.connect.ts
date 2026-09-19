/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 breadcrumb 相关实现。

import type { NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { BreadcrumbApi, BreadcrumbNodeMeta, BreadcrumbSchema } from './breadcrumb.types'
import { createPressTracker, dataAttr } from '@xihan-ui/core'
import { breadcrumbAnatomy } from './breadcrumb.anatomy'
import { buildBreadcrumbItems, normalizeBreadcrumbNodes } from './breadcrumb.range'

const parts = breadcrumbAnatomy.build()

// Breadcrumb 没有业务状态：属性来自 props 与部件自报的声明，机器只承载按压通道。
// 结构语义靠作者写的标签给（root 是 nav、list 是 ol、item/separator/ellipsis 是 li），这里不补 role。
export function connectBreadcrumb<T extends PropTypes>(
  service: Service<BreadcrumbSchema>,
  normalize: NormalizeProps<T>,
): BreadcrumbApi<T> {
  const { prop, context, send } = service
  const label = prop('translations')?.root ?? 'Breadcrumb'
  // collection 推出的层级元信息，折叠序列由它派生，两处数学只有一份
  const collection: BreadcrumbNodeMeta[] = normalizeBreadcrumbNodes(prop('collection') ?? [])
  const items = buildBreadcrumbItems(collection, prop('maxItems'))
  // 按压通道：真源是机器 context 里「正被按住的那一条」（按 value 记），每条链接各自合成一份跟踪器；
  // Space / Enter 与触屏按住投影 data-pressed，指针按住由 :active 表出，家族配方两者同一档。
  // 当前页那条不可点，它的当前页事实随 PRESS.START 带给机器的 canPress 守卫
  const pressedValue = context.get('pressedValue')
  const press = (value: string, current: boolean): PressHandlers => createPressTracker({
    isPressed: () => context.get('pressedValue') === value,
    onChange: down => send(down ? { type: 'PRESS.START', value, current } : { type: 'PRESS.END', value }),
  })

  return {
    collection,
    items,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'aria-label': label,
      // 只有作者显式给了才写
      'dir': prop('dir'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
    }),

    getListProps: () => normalize.element({
      ...parts.list.attrs,
    }),

    getItemProps: () => normalize.element({
      ...parts.item.attrs,
    }),

    getLinkProps: (link) => {
      const current = !!link.current
      const handlers = press(link.value, current)
      return normalize.element({
        ...parts.link.attrs,
        // 非布尔 aria，省略即"不是当前项"
        'aria-current': current ? 'page' : undefined,
        // 布尔 aria，显式写 true/false
        'aria-disabled': current ? 'true' : 'false',
        // 当前页那条退出 Tab 序列；非当前页不写 tabindex，沿用 <a href> 的原生行为
        'tabindex': current ? -1 : undefined,
        'data-current': dataAttr(current),
        // 链接归 Collection Item 导航当前（真源 §4.1）：面、字色、字重、光标与按压时间线由家族按 nav 语境给；
        // 当前页显式投影 terminal——它同时带 aria-disabled='true'，不显式标就会被家族的禁用面吃掉
        'data-xh-collection-item': '',
        'data-xh-collection-size': prop('size') ?? 'md',
        'data-xh-collection-context': 'nav',
        'data-xh-collection-terminal': dataAttr(current),
        // Space / Enter 与触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active；当前页那条不进
        'data-pressed': dataAttr(pressedValue === link.value),
        // 当前页那条拦下点击，避免 href 跳到自己
        'onClick': (event: MouseEvent) => {
          if (current)
            event.preventDefault()
        },
        'onKeyDown': handlers.onKeyDown,
        'onKeyUp': handlers.onKeyUp,
        'onBlur': handlers.onBlur,
        'onPointerDown': handlers.onPointerDown,
        'onPointerUp': handlers.onPointerUp,
        'onPointerCancel': handlers.onPointerCancel,
      })
    },

    // 链接里的图标纯装饰，文字才是可及名
    getLinkIconProps: () => normalize.element({
      ...parts['link-icon'].attrs,
      'aria-hidden': true,
    }),

    // 分隔符纯视觉，不进读屏
    getSeparatorProps: () => normalize.element({
      ...parts.separator.attrs,
      'aria-hidden': true,
    }),

    // 省略号纯视觉占位，不进读屏
    getEllipsisProps: () => normalize.element({
      ...parts.ellipsis.attrs,
      'aria-hidden': true,
    }),
  }
}
