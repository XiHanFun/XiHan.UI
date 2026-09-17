/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 dialog 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { DialogApi, DialogPressedPart, DialogSchema } from './dialog.types'
import { createPressTracker, dataAttr } from '@xihan-ui/core'
import { dialogAnatomy } from './dialog.anatomy'

const parts = dialogAnatomy.build()

export function connectDialog<T extends PropTypes>(
  service: Service<DialogSchema>,
  normalize: NormalizeProps<T>,
): DialogApi<T> {
  const { state, prop, send, context, scope } = service
  const open = state.get() === 'open'
  const modal = prop('modal') ?? true
  const role = prop('role') ?? 'dialog'
  const ids = scope.ids('dialog', 'trigger', 'content', 'title', 'description')
  const stateAttr = open ? 'open' : 'closed'

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send({ type: next ? 'OPEN' : 'CLOSE' })
  }

  // 按压通道：两颗按钮各自合成一份跟踪器，真源是机器 context 里「正被按住的那颗」；
  // Space / Enter 与触屏按住投影 data-pressed，指针按住由 :active 表出，皮肤两者同一档
  const pressed = context.get('pressed')
  const press = (part: DialogPressedPart) => {
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
    getBackdropProps: () => normalize.element({
      ...parts.backdrop.attrs,
      'data-state': stateAttr,
      // 形态轴落在 backdrop 上：三档换的都是这一层自己的底色与模糊
      'data-variant': prop('variant'),
      // 非模态不激活遮罩；Vue/React 据此不创建节点，WC 隐藏作者节点。
      'hidden': !modal || undefined,
    }),
    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      'data-state': stateAttr,
      // 由皮肤的 inset 直接摆，不问引擎要坐标，没有「还没量完」的窗口：恒已落位
      'data-positioned': '',
    }),
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': role,
      'tabindex': -1,
      'inert': !open || undefined,
      'aria-hidden': !open || undefined,
      // 显式写 false 而非省略：读屏对未声明与声明为非模态处理不同
      'aria-modal': modal ? 'true' : 'false',
      'aria-labelledby': ids.title,
      'aria-describedby': ids.description,
      'data-state': stateAttr,
      // 尺寸轴落在 content 上：解剖里没有 root，positioner 非必需，且 content 会被 portal 走
      'data-size': prop('size'),
      // 收起态自带 hidden：positioner 非必需部件，最小结构下没有别的节点兜底
      'hidden': !open || undefined,
    }),
    // 面板三段：头与尾定在原处，正文自己滚
    getHeaderProps: () => normalize.element({ ...parts.header.attrs }),
    // 语气徽记：纯装饰，读屏内容由标题与说明承担。画什么图形由节点自己那份 data-tone 决定
    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      'aria-hidden': true,
    }),
    getTitleProps: () => normalize.element({ ...parts.title.attrs, id: ids.title }),
    getDescriptionProps: () => normalize.element({ ...parts.description.attrs, id: ids.description }),
    getBodyProps: () => normalize.element({ ...parts.body.attrs }),
    getFooterProps: () => normalize.element({ ...parts.footer.attrs }),
    getCloseTriggerProps: () => normalize.button({
      ...parts['close-trigger'].attrs,
      'type': 'button',
      'aria-label': prop('translations')?.close ?? 'Close',
      // 面板角落的叉：icon 档 sm、ghost 面，白面上走画布承载阶梯（hover 100 → pressed 200）
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'sm',
      'data-xh-action-variant': 'ghost',
      ...press('close-trigger'),
      'onClick': () => send({ type: 'CLOSE', src: 'close-trigger' }),
    }),
  }
}
