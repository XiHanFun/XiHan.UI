/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 collapsible 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { CollapsibleApi, CollapsibleSchema } from './collapsible.types'
import { dataAttr } from '@xihan-ui/core'
import { pressHandlers } from '../shared/press'
import { collapsibleAnatomy } from './collapsible.anatomy'

const parts = collapsibleAnatomy.build()

export function connectCollapsible<T extends PropTypes>(
  service: Service<CollapsibleSchema>,
  normalize: NormalizeProps<T>,
): CollapsibleApi<T> {
  const { state, prop, send, scope, context } = service
  const open = state.get() === 'open'
  const disabled = !!prop('disabled')
  // 按压通道：真源在机器 context，跟踪器只把 Space / Enter 与触屏按住翻成事件；指针按住由 :active 表出
  const pressed = context.get('pressed')
  const press = pressHandlers(service)
  const ids = scope.ids('collapsible', 'trigger', 'content')
  const stateAttr = open ? 'open' : 'closed'

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send({ type: next ? 'OPEN' : 'CLOSE' })
  }

  return {
    open,
    setOpen,
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': stateAttr,
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-disabled': dataAttr(disabled),
      // 只在作者显式给了时才写：写死 ltr 会切断从 RTL 祖先继承来的方向
      'dir': prop('dir'),
    }),
    getHeaderProps: () => normalize.element({
      ...parts.header.attrs,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
    }),
    // 触发器是铺满一行的 disclosure trigger：接 Action Control 的 disclosure-trigger 档，ghost 形态、
    // 按下只换面不缩放（§9.2）；根无壳，阶梯按画布承载走；档位随 size 走
    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      'data-xh-action-control': '',
      'data-xh-action-profile': 'disclosure-trigger',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': prop('size') ?? 'md',
      'aria-controls': ids.content,
      'aria-expanded': open ? 'true' : 'false',
      // 单体控件用原生 disabled，只留 data-disabled 的话禁用态只是样式
      'disabled': disabled || undefined,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      // Space / Enter 与触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active（disclosure-trigger 只换面）；
      // 与开合互相独立
      'data-pressed': dataAttr(pressed),
      'onKeyDown': press.onKeyDown,
      'onKeyUp': press.onKeyUp,
      'onBlur': press.onBlur,
      'onPointerDown': press.onPointerDown,
      'onPointerUp': press.onPointerUp,
      'onPointerCancel': press.onPointerCancel,
      'onClick': () => {
        if (!disabled)
          send({ type: 'TOGGLE' })
      },
    }),
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'data-state': stateAttr,
      'hidden': !open || undefined,
      // 收起动画播完之前 content 还在渲染，此时 hidden 已被皮肤的 display 盖掉，
      // 靠 inert 把这一段窗口里的内容挡在读屏与 Tab 序之外
      'inert': !open || undefined,
    }),
    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      // 开合状态由 trigger 的 aria-expanded 念出来，这枚标记只是同一件事的图形版
      'aria-hidden': true,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
    }),
  }
}
