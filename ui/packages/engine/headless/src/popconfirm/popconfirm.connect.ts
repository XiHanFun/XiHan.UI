/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 popconfirm 相关实现。

import type { NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { PopoverPressedPart, PopoverSchema } from '../popover'
import type { PopconfirmApi, PopconfirmIntents } from './popconfirm.types'
import { createPressTracker, dataAttr } from '@xihan-ui/core'
import { createConfirmGate } from '../shared/confirm-gate'
import { OVERLAY_PLACEMENT_ANCHORED, overlayArrowVars, overlayAvailableSpaceVars, overlayFixedStyle, overlayPositioned } from '../shared/overlay'
import { popconfirmAnatomy } from './popconfirm.anatomy'

/** 没传 placement 时浮层交给定位引擎的落点。 */
export const POPCONFIRM_DEFAULT_PLACEMENT = OVERLAY_PLACEMENT_ANCHORED

const parts = popconfirmAnatomy.build()

/**
 * 气泡确认跑 popover 机器：开合、定位、消解层与焦点域全在那里，本组件只贴自己的解剖与角色属性。
 * 确认与取消这两个意图不入机器——它们除了收起浮层不改任何状态，由这里转给回调后再请求收起。
 */
export function connectPopconfirm<T extends PropTypes>(
  service: Service<PopoverSchema>,
  props: PopconfirmIntents,
  normalize: NormalizeProps<T>,
): PopconfirmApi<T> {
  const { state, prop, send, context, scope } = service
  const open = state.get() === 'open'
  const ids = scope.ids('popconfirm', 'trigger', 'content', 'title', 'description')
  const rendered = prop('parts')
  const stateAttr = open ? 'open' : 'closed'
  const disabled = !!prop('disabled')
  // 位置由引擎写进 context，这里只读结果，不量 DOM、不调引擎
  const position = context.get('position')
  // 箭头落点：引擎没算（没要箭头 / 尚未落位）时缺席，皮肤退回居中
  const arrowAt = position?.arrow
  const placement = position?.placement ?? prop('placement') ?? POPCONFIRM_DEFAULT_PLACEMENT

  // 确认与取消都属于明确的按钮关闭，统一以 close-trigger 上报
  const gate = createConfirmGate(service, props, () => send({ type: 'CLOSE', src: 'close-trigger' }))
  const isPending = gate.isPending
  const setOpen = (next: boolean): void => {
    // 确认事务尚未落定时，程序调用与 trigger 都不能从侧门收起；取消和兑现有各自的显式出口。
    if (!next && gate.isLocked())
      return
    if (next !== open)
      send({ type: next ? 'OPEN' : 'CLOSE' })
  }
  const confirm = gate.confirm
  const cancel = gate.cancel

  // 按压通道：三颗按钮各自合成一份跟踪器，真源是 popover 机器 context 里「正被按住的那颗」
  // （两颗动作钮并排，只记一个布尔分不清按住的是哪颗）；Space / Enter 与触屏按住投影 data-pressed，
  // 指针按住由 :active 表出，皮肤两者同一档；浮层收起时机器一并松开
  const pressed = context.get('pressed')
  const press = (part: PopoverPressedPart): PressHandlers & { 'data-pressed': '' | undefined } => {
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
    get pending() {
      return isPending()
    },
    actionError: props.actionError ?? null,
    setOpen,
    confirm,
    cancel,
    // 根只框住触发器，浮层树靠 positioner 的固定定位飞出去；状态落在根上供整组样式取用
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': stateAttr,
    }),
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
      // 确认禁用时触发器没有别的用处：原生 disabled 退出 Tab 序列，家族按 data-disabled 画禁用面
      'disabled': disabled || undefined,
      'data-disabled': dataAttr(disabled),
      ...press('trigger'),
      'onClick': () => {
        // 作者把这份 props 摊到非按钮节点上时原生 disabled 不生效，守卫得自己带
        if (!disabled)
          setOpen(!open)
      },
    }),
    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      // 定位层被搬到 portal 落点，继承不到作者子树上的方向；作者没给就不写，交给落点处的继承
      'dir': prop('dir'),
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点被滚出可视区时引擎置 hidden，样式据此收起浮层
      'data-hidden': dataAttr(position?.hidden),
      // 落位才露：皮肤基线把定位层藏着，带这个才显示。展开那几帧坐标还没算出来时就是藏的
      'data-positioned': dataAttr(overlayPositioned(position)),
      'style': {
        ...overlayFixedStyle(position),
        ...overlayAvailableSpaceVars('popconfirm', position),
      },
    }),
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      // 锚定瞬态浮层的内容面：皮肤按材质家族配方画 frosted 四件套与 1px 顶光
      'data-xh-material': 'frosted',
      'id': ids.content,
      // Popconfirm 是不陷焦点、不锁页面的非模态确认面；dialog 与这份交互合同一致。
      'role': 'dialog',
      'tabindex': -1,
      // Presence 会把收起内容留到动画结束；这段期间必须先退出焦点树与交互树。
      'inert': !open || undefined,
      'aria-hidden': !open || undefined,
      // 只引用作者渲染了的标题与说明：省略 parts 按都在场
      'aria-labelledby': rendered?.title !== false ? ids.title : undefined,
      'aria-describedby': rendered?.description !== false ? ids.description : undefined,
      'data-state': stateAttr,
      // 挂载时就开着的这一段直接呈现，不播进场
      'data-instant': dataAttr(context.get('openedAtMount')),
      'data-placement': placement,
      // 尺寸落在浮层树最外层的 content 上：positioner 是定位空壳，root 留在触发器那边
      'data-size': prop('size'),
      // 收起时留在 DOM 只隐藏，不卸载作者节点
      'hidden': !open || undefined,
    }),
    getTitleProps: () => normalize.element({ ...parts.title.attrs, id: ids.title }),
    getDescriptionProps: () => normalize.element({ ...parts.description.attrs, id: ids.description }),
    getConfirmTriggerProps: () => normalize.button({
      ...parts['confirm-trigger'].attrs,
      'type': 'button',
      // 挂起不改原生 disabled，焦点不会被踢走；aria-disabled 明确说明重复确认不可用。
      'aria-busy': isPending() ? 'true' : undefined,
      'aria-disabled': isPending() ? 'true' : undefined,
      'data-loading': dataAttr(isPending()),
      // 异步确认挂起：加载环配方把环压在确认钮正中，挂起一个 micro 之后才淡入
      'data-xh-loading-ring': 'overlay',
      // 确认是本浮层的主要动作，与 Button 主动作同待遇：text 档 sm、显式 solid，
      // 语气由 content 上的 data-tone 经 --xh-_tone 下发；挂起期间家族的 loading 面接管 hover / pressed
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'sm',
      'data-xh-action-variant': 'solid',
      'data-xh-ink-surface': '',
      ...press('confirm-trigger'),
      'onClick': confirm,
    }),
    getCancelTriggerProps: () => normalize.button({
      ...parts['cancel-trigger'].attrs,
      'type': 'button',
      // 取消是中性的次要出口：text 档 sm、outline 描边，不参与语气
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'sm',
      'data-xh-action-variant': 'outline',
      ...press('cancel-trigger'),
      'onClick': cancel,
    }),
    getArrowProps: () => normalize.element({
      ...parts.arrow.attrs,
      'aria-hidden': true,
      'data-placement': placement,
      // 箭头交叉轴上的落点由定位引擎给：上下两侧走行内轴、左右两侧走块轴。
      // 两根轴每帧都写，翻面后另一根不会留着上一帧的值；空串即撤掉声明，皮肤退回居中
      'style': overlayArrowVars('popconfirm', arrowAt),
    }),
  }
}
