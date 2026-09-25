/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 back top 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { BackTopApi, BackTopSchema } from './back-top.types'
import { dataAttr } from '@xihan-ui/core'
import { pressHandlers } from '../shared/press'
import { backTopAnatomy } from './back-top.anatomy'

const parts = backTopAnatomy.build()

export function connectBackTop<T extends PropTypes>(
  service: Service<BackTopSchema>,
  normalize: NormalizeProps<T>,
): BackTopApi<T> {
  const { state, context, prop, send } = service

  const visible = state.matches('visible')
  // 缺省 outline：描边 + 磨砂面的中性圆钮（只有 Button 缺省品牌实心）
  const variant = prop('variant') ?? 'outline'
  // 键盘 / 触屏按住期间的按压面；指针按住由 :active 表出，皮肤两者同一档
  const press = pressHandlers(service)

  return {
    visible,
    scrollToTop: () => send({ type: 'TRIGGER.CLICK' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': visible ? 'visible' : 'hidden',
      // 三个视觉轴落在壳上，按钮沿继承流取值
      'data-variant': variant,
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      // 收起时留着节点，只加 hidden：靠不透明度藏起来的按钮仍然可聚焦、仍然被读屏念到
      'hidden': !visible || undefined,
    }),

    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      // 写死 button：不写的话放在表单里会当成提交按钮
      'type': 'button',
      // 按钮里通常只有一个图标，可及名字只能由这里给
      'aria-label': prop('translations')?.trigger ?? 'Back to top',
      'data-state': visible ? 'visible' : 'hidden',
      // 浮在内容之上的单图标圆钮：盒型、四态面、0.97 按压与 44px 命中区由家族配方按 floating 档给出
      'data-xh-action-control': '',
      'data-xh-action-profile': 'floating',
      'data-xh-action-display': 'always',
      'data-xh-action-size': prop('size') ?? 'md',
      'data-xh-action-variant': variant,
      // 浮在内容之上的导航层部件：data-material="liquid" 下换成液态面，standard 档下这个标记没人读
      'data-xh-liquid': '',
      'data-pressed': dataAttr(context.get('pressed')),
      'onClick': () => send({ type: 'TRIGGER.CLICK' }),
      'onKeyDown': press.onKeyDown,
      'onKeyUp': press.onKeyUp,
      'onBlur': press.onBlur,
      'onPointerDown': press.onPointerDown,
      'onPointerUp': press.onPointerUp,
      'onPointerCancel': press.onPointerCancel,
    }),
  }
}
