/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 float button 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { FloatButtonApi, FloatButtonAppearance, FloatButtonPlacement, FloatButtonPosition, FloatButtonSchema } from './float-button.types'
import { dataAttr } from '@xihan-ui/core'
import { pressHandlers } from '../shared/press'
import { floatButtonAnatomy } from './float-button.anatomy'
import { floatButtonPlacementOf, isFloatButtonEdgePosition, normalizeFloatButtonRatio } from './float-button.geometry'

const parts = floatButtonAnatomy.build()

/** 不给落位时钉在尾下角。 */
export const FLOAT_BUTTON_DEFAULT_PLACEMENT: FloatButtonPlacement = 'bottom-end'

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
  // 液态档收起后动作正融回触发器：展开组还在原处，但已不可交互
  const merging = !open && context.get('merging')
  const disabled = !!prop('disabled')
  const ids = scope.ids('float-button', 'trigger', 'list')
  const stateAttr = open ? 'open' : 'closed'
  const offset = resolveFloatButtonOffset(props.offset)
  // 位置：提交过的位置压过 placement 那一角；拖动与落定途中的跟手坐标再压过提交了的位置
  const position = context.get('position')
  const moving = context.get('movingPoint')
  const edge = position && isFloatButtonEdgePosition(position) ? position : null
  const point = position && !isFloatButtonEdgePosition(position) ? position : null
  // 展开组的朝向与锚定的那两条边都由落位定：贴边与停在一点时按位置推出来，展开组朝页面中间长
  const placement = position
    ? floatButtonPlacementOf(position, context.get('viewportHeight'))
    : (props.placement ?? FLOAT_BUTTON_DEFAULT_PLACEMENT)
  const draggable = !!prop('draggable') && !disabled
  // 几何写成内联自定义属性，贴哪条边、按哪个比例排由皮肤按 data-edge / data-point / data-moving 决定
  const geometry = [`--xh-_float-button-offset: ${offset}px`]
  if (edge)
    geometry.push(`--xh-_float-button-ratio: ${normalizeFloatButtonRatio(edge.ratio)}`)
  const at = moving ?? point
  if (at)
    geometry.push(`--xh-_float-button-x: ${at.x}px`, `--xh-_float-button-y: ${at.y}px`)
  const hover = prop('expandTrigger') === 'hover'
  // 缺省 outline：描边 + 磨砂面的中性圆钮（只有 Button 缺省品牌实心）
  const variant = props.variant ?? 'outline'
  // 键盘 / 触屏按住期间的按压面；指针按住由 :active 表出，皮肤两者同一档
  const press = pressHandlers(service)

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send(next ? { type: 'OPEN' } : { type: 'CLOSE', src: 'programmatic' })
  }

  const setPosition = (next: FloatButtonPosition): void => context.set('position', next)

  return {
    open,
    setOpen,
    position,
    setPosition,
    dragging: context.get('dragging'),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': stateAttr,
      'data-placement': placement,
      // 三个视觉轴落在壳上，触发器与展开的每一条动作沿继承流取值
      'data-variant': variant,
      'data-tone': props.tone,
      'data-size': props.size,
      'data-disabled': dataAttr(disabled),
      // 贴在哪条边、停在哪一点、正跟着指针走：皮肤据此换掉角落那两条贴边
      'data-edge': edge?.edge,
      'data-point': dataAttr(point != null),
      'data-moving': dataAttr(moving != null),
      'data-draggable': dataAttr(draggable),
      'data-dragging': dataAttr(context.get('dragging')),
      'dir': prop('dir'),
      'style': geometry.join('; '),
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
      // 浮在内容之上的单图标圆钮：盒型、四态面、0.97 按压与 44px 命中区由家族配方按 floating 档给出
      'data-xh-action-control': '',
      'data-xh-action-profile': 'floating',
      'data-xh-action-display': 'always',
      'data-xh-action-size': props.size ?? 'md',
      'data-xh-action-variant': variant,
      'data-xh-ink-surface': dataAttr(variant === 'solid'),
      // 浮在内容之上的导航层部件：data-material="liquid" 下换成液态面，standard 档下这个标记没人读
      'data-xh-liquid': '',
      // 缺省 outline 这一档是 frosted 材质面：皮肤按材质家族配方取面，液态档由配方换值
      'data-xh-material': variant === 'outline' ? 'frosted' : undefined,
      'data-pressed': dataAttr(context.get('pressed')),
      // 点一下恒能开合：悬停只是多给一条路，触摸与键盘还得靠它
      'onClick': () => {
        // 刚拖完：位置已由松手决定，浏览器补派的这一下不再开合
        if (context.get('swallowClick')) {
          send({ type: 'CLICK.SWALLOW' })
          return
        }
        if (!disabled)
          send({ type: 'TOGGLE' })
      },
      'onKeyDown': press.onKeyDown,
      'onKeyUp': press.onKeyUp,
      'onBlur': press.onBlur,
      'onPointerDown': (event: PointerEvent) => {
        press.onPointerDown(event)
        // 只认主键；按下先不算拖动，移动过激活距离才接管，点按照常经 click 开合
        if (draggable && event.button === 0)
          send({ type: 'DRAG.START', pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY })
      },
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
      // 挂载时就开着的这一段直接呈现：里面的动作不逐条冒出
      'data-instant': dataAttr(context.get('openedAtMount')),
      'data-placement': placement,
      // 收起时留着节点只隐藏：靠不透明度藏起来的按钮仍然可聚焦、仍然被读屏念到
      'hidden': (!open && !merging) || undefined,
      // 融回途中展开组还看得见，用 inert 挡在读屏与 Tab 序之外
      'inert': merging || undefined,
      // 液态档下展开组给里面的动作供液态面的私有槽；standard 档下这个标记没人读
      'data-xh-liquid': '',
    }),
  }
}
