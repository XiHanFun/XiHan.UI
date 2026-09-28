/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 dialog 相关实现。

import type { NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { DialogApi, DialogPressedPart, DialogSchema } from './dialog.types'
import { createPressTracker, dataAttr, focusSafely } from '@xihan-ui/core'
import { dialogAnatomy } from './dialog.anatomy'
import { DIALOG_ARROW_DELTA, DIALOG_DRAG_LARGE_STEP, DIALOG_DRAG_STEP } from './dialog.gesture'

const parts = dialogAnatomy.build()

/** 拖动区里这些节点照常点：按钮、链接、表单控件不因为落在标题栏里就被拖走。 */
const INTERACTIVE = 'button, a[href], input, select, textarea, [contenteditable=""], [contenteditable="true"], [role="button"], [tabindex]:not([tabindex="-1"])'

/** 带 Ctrl / Meta / Alt 的组合归浏览器与读屏，Shift 是大步长开关要放行。 */
function hasForeignModifier(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey || event.altKey
}

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
  const draggable = !!prop('draggable')
  const offset = context.get('offset')
  const dragging = context.get('gesture') === 'drag'

  /**
   * 指针按在拖动区（标题栏、标题或拖动把手）上：只认主键，落在区里的按钮、链接与表单控件照常点。
   * 挡掉文本选中与默认聚焦，面板从这一刻起跟手。
   */
  const startDrag = (event: PointerEvent): void => {
    if (!draggable || event.button !== 0)
      return
    const hit = (event.target as Element | null)?.closest?.(INTERACTIVE)
    if (hit && hit !== event.currentTarget)
      return
    event.preventDefault()
    send({ type: 'DRAG.START', point: { clientX: event.clientX, clientY: event.clientY }, pointerId: event.pointerId })
  }
  // 首帧标记：挂载时就开着、还没收起过
  const instant = dataAttr(context.get('openedAtMount'))

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send({ type: next ? 'OPEN' : 'CLOSE' })
  }

  // 按压通道：两颗按钮各自合成一份跟踪器，真源是机器 context 里「正被按住的那颗」；
  // Space / Enter 与触屏按住投影 data-pressed，指针按住由 :active 表出，皮肤两者同一档
  const pressed = context.get('pressed')
  const press = (part: DialogPressedPart): PressHandlers & { 'data-pressed': '' | undefined } => {
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
    offset,
    dragging,
    setOpen,
    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      'aria-haspopup': 'dialog',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.content,
      'data-state': stateAttr,
      // 页面上的独立文字按钮：盒型、四态面、0.97 按压与粗指针命中区由家族配方按 text 档给出；
      // 缺省 outline 描边（只有 Button 缺省品牌实心）。作者以 asChild 换成自己的按钮时，
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
      // 挂载时就开着的这一段直接呈现，不播进场
      'data-instant': instant,
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
      'data-instant': instant,
      // 尺寸轴落在 content 上：解剖里没有 root，positioner 非必需，且 content 会被 portal 走
      'data-size': prop('size'),
      // 拖动：位移写成两个私有槽，皮肤按它平移面板；跟手期间另打 data-dragging
      'data-draggable': dataAttr(draggable),
      'data-dragging': dataAttr(dragging),
      // 没开拖动时写空串：撤掉上一轮留在节点上的位移
      'style': {
        '--xh-_dialog-drag-x': draggable ? `${offset.x}px` : '',
        '--xh-_dialog-drag-y': draggable ? `${offset.y}px` : '',
      },
      // 收起态自带 hidden：positioner 非必需部件，最小结构下没有别的节点兜底
      'hidden': !open || undefined,
    }),
    // 面板三段：头与尾定在原处，正文自己滚。可拖动时标题栏就是拖动区
    getHeaderProps: () => normalize.element({
      ...parts.header.attrs,
      'data-draggable': dataAttr(draggable),
      'onPointerDown': draggable ? startDrag : undefined,
    }),
    getDragTriggerProps: () => normalize.button({
      ...parts['drag-trigger'].attrs,
      'type': 'button',
      'aria-label': prop('translations')?.dragTrigger ?? 'Move dialog',
      // 没开拖动时推不动：用 aria-disabled 而不是原生 disabled，把手仍留在 Tab 序列里读得到
      'aria-disabled': draggable ? 'false' : 'true',
      'data-disabled': dataAttr(!draggable),
      'data-dragging': dataAttr(dragging),
      'onPointerDown': (event: PointerEvent) => {
        startDrag(event)
        // 上一句挡掉了浏览器自带的聚焦，这里补回来：手拖完之后方向键要接着能挪
        if (draggable && event.button === 0)
          focusSafely(event.currentTarget as HTMLElement)
      },
      'onKeyDown': (event: KeyboardEvent) => {
        if (!draggable || hasForeignModifier(event))
          return
        // 激活键把面板送回居中落点：拖出去之后这是不靠鼠标的那条回收路
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          send({ type: 'DRAG.RESET' })
          return
        }
        const delta = DIALOG_ARROW_DELTA[event.key]
        // 不在表里的键既不挪面板也不 preventDefault，原样放行
        if (!delta)
          return
        event.preventDefault()
        const step = event.shiftKey ? DIALOG_DRAG_LARGE_STEP : DIALOG_DRAG_STEP
        send({ type: 'DRAG.NUDGE', dx: delta.dx * step, dy: delta.dy * step })
      },
    }),
    // 语气徽记：纯装饰，读屏内容由标题与说明承担。画什么图形由节点自己那份 data-tone 决定
    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      'aria-hidden': true,
    }),
    // 没写 header 的面板，标题就是标题栏：同样是拖动区
    getTitleProps: () => normalize.element({
      ...parts.title.attrs,
      'id': ids.title,
      'data-draggable': dataAttr(draggable),
      'onPointerDown': draggable ? startDrag : undefined,
    }),
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
