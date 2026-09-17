/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 float button 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { FloatButtonApi, FloatButtonAppearance, FloatButtonPlacement, FloatButtonSchema } from './float-button.types'
import { dataAttr } from '@xihan-ui/core'
import { pressHandlers } from '../shared/press'
import { floatButtonAnatomy } from './float-button.anatomy'

const parts = floatButtonAnatomy.build()

/** 不给落位时钉在尾下角。 */
export const FLOAT_BUTTON_DEFAULT_PLACEMENT: FloatButtonPlacement = 'bottom-end'

/** 不给外形时是圆的。 */

/** 不给距离时距那两条边 24px。 */
export const FLOAT_BUTTON_DEFAULT_OFFSET = 24

/** 贴边距离归一：夹到非负，非有限数退回缺省。 */
export function resolveFloatButtonOffset(offset: number | undefined): number {
  if (offset == null || !Number.isFinite(offset))
    return FLOAT_BUTTON_DEFAULT_OFFSET
  return Math.max(0, offset)
}

/**
 * 开合与逻辑层资源由 FloatButton 专用机器持有；connect 只投影 DOM 属性与局部指针意图。
 */
export function connectFloatButton<T extends PropTypes>(
  service: Service<FloatButtonSchema>,
  props: FloatButtonAppearance,
  normalize: NormalizeProps<T>,
): FloatButtonApi<T> {
  const { state, context, prop, send, scope } = service

  const open = state.get() === 'open'
  const disabled = !!prop('disabled')
  const ids = scope.ids('float-button', 'trigger', 'list')
  const stateAttr = open ? 'open' : 'closed'
  const placement = props.placement ?? FLOAT_BUTTON_DEFAULT_PLACEMENT
  const offset = resolveFloatButtonOffset(props.offset)
  const hover = prop('expandTrigger') === 'hover'
  // 缺省 outline：描边 + 磨砂面的中性圆钮（真源 §7.2 第 2 条：只有 Button 缺省品牌实心）
  const variant = props.variant ?? 'outline'
  // 键盘 / 触屏按住期间的按压面；指针按住由 :active 表出，皮肤两者同一档
  const press = pressHandlers(service)

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send(next ? { type: 'OPEN' } : { type: 'CLOSE', src: 'programmatic' })
  }

  return {
    open,
    setOpen,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': stateAttr,
      'data-placement': placement,
      // 三个视觉轴落在壳上，触发器与展开的每一条动作沿继承流取值
      'data-variant': variant,
      'data-tone': props.tone,
      'data-size': props.size,
      'data-disabled': dataAttr(disabled),
      'dir': prop('dir'),
      // 贴边距离写成内联自定义属性：贴的是哪两条边由皮肤按 data-placement 决定，这里只给数
      'style': `--xh-_float-button-offset: ${offset}px`,
      // 悬停展开：进出整个壳才算数，不是只进出触发器——指针得能走到展开的那一组上去
      ...(hover
        ? {
            onPointerEnter: () => {
              if (!disabled)
                send({ type: 'OPEN' })
            },
            onPointerLeave: () => send({ type: 'CLOSE', src: 'hover' }),
          }
        : {}),
    }),

    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      // 写死 button：不写的话放在表单里会当成提交按钮
      'type': 'button',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.list,
      // 里面通常只有一个图标，可及名字只能由这里给
      'aria-label': props.translations?.trigger ?? 'Actions',
      // 单体控件用原生 disabled，只留 data-disabled 的话禁用态只是样式
      'disabled': disabled || undefined,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      // 浮在内容之上的单图标圆钮：盒型、四态面、0.97 按压与 44px 命中区由家族配方按 floating 档给出（§4.1 / §9.1）
      'data-xh-action-control': '',
      'data-xh-action-profile': 'floating',
      'data-xh-action-display': 'always',
      'data-xh-action-size': props.size ?? 'md',
      'data-xh-action-variant': variant,
      'data-pressed': dataAttr(context.get('pressed')),
      // 点一下恒能开合：悬停只是多给一条路，触摸与键盘还得靠它
      'onClick': () => {
        if (!disabled)
          send({ type: 'TOGGLE' })
      },
      'onKeyDown': press.onKeyDown,
      'onKeyUp': press.onKeyUp,
      'onBlur': press.onBlur,
      'onPointerDown': press.onPointerDown,
      'onPointerUp': press.onPointerUp,
      'onPointerCancel': press.onPointerCancel,
    }),

    getListProps: () => normalize.element({
      ...parts.list.attrs,
      'id': ids.list,
      // 一组并列的动作；名字借触发器的，不另起一个
      'role': 'group',
      'aria-labelledby': ids.trigger,
      'data-state': stateAttr,
      'data-placement': placement,
      // 收起时留着节点只隐藏：靠不透明度藏起来的按钮仍然可聚焦、仍然被读屏念到
      'hidden': !open || undefined,
    }),
  }
}
