/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 popover 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { PopoverApi, PopoverPressedPart, PopoverSchema } from './popover.types'
import { createPressTracker, dataAttr } from '@xihan-ui/core'
import { overlayArrowVars, overlayAvailableSpaceVars, overlayFixedStyle, overlayPositioned } from '../shared/overlay'
import { popoverAnatomy } from './popover.anatomy'
import { POPOVER_DEFAULT_PLACEMENT } from './popover.machine'

const parts = popoverAnatomy.build()

export function connectPopover<T extends PropTypes>(
  service: Service<PopoverSchema>,
  normalize: NormalizeProps<T>,
): PopoverApi<T> {
  const { state, prop, send, context, scope } = service
  const open = state.get() === 'open'
  const modal = prop('modal') ?? false
  const ids = scope.ids('popover', 'trigger', 'content', 'title', 'description')
  const stateAttr = open ? 'open' : 'closed'
  // 位置由引擎写进 context，这里只读结果，不量 DOM、不调引擎
  const position = context.get('position')
  // 箭头落点：引擎没算（没要箭头 / 尚未落位）时缺席，皮肤退回居中
  const arrowAt = position?.arrow
  const placement = position?.placement ?? prop('placement') ?? POPOVER_DEFAULT_PLACEMENT

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send({ type: next ? 'OPEN' : 'CLOSE' })
  }

  // 按压通道：两颗按钮各自合成一份跟踪器，真源是机器 context 里「正被按住的那颗」；
  // Space / Enter 与触屏按住投影 data-pressed，指针按住由 :active 表出，皮肤两者同一档
  const pressed = context.get('pressed')
  const press = (part: PopoverPressedPart) => {
    const handlers = createPressTracker({
      isPressed: () => context.get('pressed') === part,
      onChange: down => send({ type: down ? 'PRESS.START' : 'PRESS.END', part }),
    })
    return {
      'data-pressed': dataAttr(pressed === part),
      'onKeyDown': handlers.onKeyDown,
      'onKeyUp': handlers.onKeyUp,
      'onBlur': handlers.onBlur,
      'onPointerDown': handlers.onPointerDown,
      'onPointerUp': handlers.onPointerUp,
      'onPointerCancel': handlers.onPointerCancel,
    }
  }

  return {
    open,
    setOpen,
    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      'aria-haspopup': 'dialog',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.content,
      'data-state': stateAttr,
      // 页面上的独立文字按钮：盒型、四态面、0.97 按压与粗指针命中区由家族配方按 text 档给出（§4.1 / §9.1）；
      // 缺省 outline 描边（§7.2 第 2 条：只有 Button 缺省品牌实心）。作者以 asChild 换成自己的按钮时，
      // 这几条家族标记不落到它身上（适配器合并时跳过 data-xh-*）
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'md',
      'data-xh-action-variant': 'outline',
      ...press('trigger'),
      'onClick': () => send({ type: 'TOGGLE' }),
    }),
    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      // 定位层被搬到 portal 落点，继承不到作者子树上的方向；作者没给就不写，交给落点处的继承
      'dir': prop('dir'),
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点被滚出可视区时引擎会置 hidden，样式据此收起浮层
      // 锚点被滚出可视区时引擎置 hidden，样式据此收起浮层
      'data-hidden': dataAttr(position?.hidden),
      // 落位才露：皮肤基线把定位层藏着，带这个才显示。展开那几帧坐标还没算出来时就是藏的
      'data-positioned': dataAttr(overlayPositioned(position)),
      'style': {
        ...overlayFixedStyle(position),
        ...overlayAvailableSpaceVars('popover', position),
      },
    }),
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'dialog',
      'tabindex': -1,
      // Presence 会把收起内容留到动画结束；这段期间必须先退出焦点树与交互树。
      'inert': !open || undefined,
      'aria-hidden': !open || undefined,
      'aria-modal': modal ? 'true' : 'false',
      'aria-labelledby': ids.title,
      'aria-describedby': ids.description,
      'data-state': stateAttr,
      'data-placement': placement,
      // popover 没有 root 部件，尺寸轴落在浮层树最外层的 content 上
      'data-size': prop('size'),
      // 收起时留在 DOM 只隐藏，不卸载作者节点
      'hidden': !open || undefined,
    }),
    getTitleProps: () => normalize.element({ ...parts.title.attrs, id: ids.title }),
    getDescriptionProps: () => normalize.element({ ...parts.description.attrs, id: ids.description }),
    getCloseTriggerProps: () => normalize.button({
      ...parts['close-trigger'].attrs,
      'type': 'button',
      'aria-label': prop('translations')?.close ?? 'Close',
      // 浮层角落的叉：icon 档 sm、ghost 面，磨砂白面上走画布承载阶梯（hover 100 → pressed 200）
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'sm',
      'data-xh-action-variant': 'ghost',
      ...press('close-trigger'),
      'onClick': () => send({ type: 'CLOSE', src: 'close-trigger' }),
    }),
    getArrowProps: () => normalize.element({
      ...parts.arrow.attrs,
      'aria-hidden': true,
      'data-placement': placement,
      // 箭头交叉轴上的落点由定位引擎给：上下两侧走行内轴、左右两侧走块轴。
      // 两根轴每帧都写，翻面后另一根不会留着上一帧的值；空串即撤掉声明，皮肤退回居中
      'style': overlayArrowVars('popover', arrowAt),
    }),
  }
}
