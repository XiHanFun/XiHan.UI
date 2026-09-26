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
  const { state, context, prop, send, scope } = service

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
      // 收起时留着节点，只加 hidden：靠不透明度藏起来的按钮仍然可聚焦、仍然被读屏念到。
      // 按钮的退场动画播完才写，否则 hidden 一落下退场一帧都播不出来
      'hidden': (!visible && !context.get('triggerRendered')) || undefined,
    }),

    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      // 机器按 id 找到它：等它的退场动画、给它接液态面
      'id': scope.partId('back-top', 'trigger'),
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
      'data-xh-ink-surface': dataAttr(variant === 'solid'),
      // 浮在内容之上的导航层部件：data-material="liquid" 下换成液态面，standard 档下这个标记没人读
      'data-xh-liquid': '',
      // 缺省 outline 这一档是 frosted 材质面：皮肤按材质家族配方取面，液态档由配方换值
      'data-xh-material': variant === 'outline' ? 'frosted' : undefined,
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
