/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 popconfirm 相关实现。

import type { NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { PopoverPressedPart, PopoverSchema } from '../popover'
import type { PopconfirmApi, PopconfirmConfirmErrorDetails, PopconfirmIntents } from './popconfirm.types'
import { createPressTracker, dataAttr } from '@xihan-ui/core'
import { OVERLAY_PLACEMENT_ANCHORED, overlayArrowVars, overlayAvailableSpaceVars, overlayFixedStyle, overlayPositioned } from '../shared/overlay'
import { popconfirmAnatomy } from './popconfirm.anatomy'

/** 没传 placement 时浮层交给定位引擎的落点。 */
export const POPCONFIRM_DEFAULT_PLACEMENT = OVERLAY_PLACEMENT_ANCHORED

const parts = popconfirmAnatomy.build()

type ConfirmPhase = 'idle' | 'invoking' | 'pending' | 'settling'

interface ConfirmTransaction {
  /** React StrictMode 会在同一 facade 里重建底层服务；state 身份把前后两台机器隔开。 */
  owner: object
  /** 每个被机器接受的开合事件都是新身份；受控关闭再重开也不能沿用旧确认票据。 */
  event: unknown
  revision: number
  phase: ConfirmPhase
  /** 真实开合已经终止事务，但适配器这一帧仍可能拿着旧 pending 快照。 */
  ignorePendingSnapshot: boolean
}

interface ConfirmToken {
  owner: object
  revision: number
}

// 一台服务同时只准有一项确认事务；同步 invoking 阶段也上锁，挡住回调重入与同拍连点。
const confirmTransactions = new WeakMap<object, ConfirmTransaction>()

function transactionOf(service: Service<PopoverSchema>): ConfirmTransaction {
  const owner = service.state as object
  const current = confirmTransactions.get(service)
  if (current?.owner === owner)
    return current
  const next: ConfirmTransaction = {
    owner,
    event: service.event.current(),
    revision: (current?.revision ?? 0) + 1,
    phase: 'idle',
    ignorePendingSnapshot: false,
  }
  confirmTransactions.set(service, next)
  return next
}

function tokenOwnsTransaction(service: Service<PopoverSchema>, token: ConfirmToken): boolean {
  const transaction = confirmTransactions.get(service)
  return transaction?.owner === token.owner
    && transaction.revision === token.revision
}

function tokenIsCurrent(service: Service<PopoverSchema>, token: ConfirmToken): boolean {
  const transaction = confirmTransactions.get(service)
  return service.getStatus() === 'Started'
    && tokenOwnsTransaction(service, token)
    && Object.is(transaction?.event, service.event.current())
}

/**
 * connect 观察到机器接受过新的开合事件，就把旧确认事务作废。
 * 这也覆盖受控宿主在组件不卸载的情况下 close → open；事件对象身份不会发生 ABA。
 */
function reconcileActionSession(service: Service<PopoverSchema>, props: PopconfirmIntents): ConfirmTransaction {
  const transaction = transactionOf(service)
  const event = service.event.current()
  if (!Object.is(transaction.event, event)) {
    const wasPending = transaction.phase === 'pending'
    transaction.event = event
    transaction.revision += 1
    transaction.phase = 'idle'
    transaction.ignorePendingSnapshot = wasPending
    if (wasPending)
      props.onPendingChange?.(false)
  }
  if (!props.pending)
    transaction.ignorePendingSnapshot = false
  return transaction
}

function beginConfirm(service: Service<PopoverSchema>, props: PopconfirmIntents): ConfirmToken | null {
  if (service.getStatus() !== 'Started')
    return null
  const transaction = reconcileActionSession(service, props)
  const externallyPending = !!props.pending && !transaction.ignorePendingSnapshot
  if (externallyPending || transaction.phase !== 'idle')
    return null
  transaction.revision += 1
  transaction.phase = 'invoking'
  transaction.event = service.event.current()
  return { owner: transaction.owner, revision: transaction.revision }
}

/** 只读一次 then；跨 realm Promise 与自定义 thenable 都走同一条同化路径。 */
function readThen(value: unknown): ((resolve: (value: unknown) => void, reject: (cause: unknown) => void) => unknown) | null {
  if ((typeof value !== 'object' || value === null) && typeof value !== 'function')
    return null
  const then = Reflect.get(value as object, 'then') as unknown
  return typeof then === 'function'
    ? then as (resolve: (value: unknown) => void, reject: (cause: unknown) => void) => unknown
    : null
}

function assimilateThenable(
  value: unknown,
  then: (resolve: (value: unknown) => void, reject: (cause: unknown) => void) => unknown,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    try {
      Reflect.apply(then, value, [resolve, reject])
    }
    catch (cause) {
      reject(cause)
    }
  })
}

function settleConfirmError(
  service: Service<PopoverSchema>,
  props: PopconfirmIntents,
  token: ConfirmToken,
  expectedPhase: 'invoking' | 'pending',
  cause: unknown,
): void {
  const transaction = transactionOf(service)
  if (!tokenIsCurrent(service, token) || transaction.phase !== expectedPhase)
    return
  transaction.phase = 'settling'
  const details: PopconfirmConfirmErrorDetails = { cause }
  try {
    if (expectedPhase === 'pending')
      props.onPendingChange?.(false)
    // 状态先落地，事件随后拿到同一个对象；cause 不包装，undefined 也不会丢。
    props.onActionErrorChange?.(details)
    props.onConfirmError?.(details)
  }
  finally {
    if (tokenOwnsTransaction(service, token))
      transaction.phase = 'idle'
  }
}

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
  const stateAttr = open ? 'open' : 'closed'
  // 位置由引擎写进 context，这里只读结果，不量 DOM、不调引擎
  const position = context.get('position')
  // 箭头落点：引擎没算（没要箭头 / 尚未落位）时缺席，皮肤退回居中
  const arrowAt = position?.arrow
  const placement = position?.placement ?? prop('placement') ?? POPCONFIRM_DEFAULT_PLACEMENT

  const isPending = (): boolean => {
    const transaction = reconcileActionSession(service, props)
    return transaction.phase === 'pending' || (!!props.pending && !transaction.ignorePendingSnapshot)
  }
  const actionLocked = (): boolean => {
    const transaction = reconcileActionSession(service, props)
    return transaction.phase !== 'idle' || (!!props.pending && !transaction.ignorePendingSnapshot)
  }
  const setOpen = (next: boolean): void => {
    // 确认事务尚未落定时，程序调用与 trigger 都不能从侧门收起；取消和兑现有各自的显式出口。
    if (!next && actionLocked())
      return
    if (next !== open)
      send({ type: next ? 'OPEN' : 'CLOSE' })
  }

  // 先把意图交出去再请求收起：受控时收起要等宿主写回 open，两件事的先后不能反过来。
  // 确认成功与取消都属于明确的按钮关闭，统一以 close-trigger 上报。
  // 回调返回 thenable 即挂起确认门：兑现才收起，拒绝留在原地并把原始原因报告出去。
  const confirm = (): void => {
    const token = beginConfirm(service, props)
    if (!token)
      return

    // 新一轮确认先撤掉上一轮错误；同步抛错与 then getter 抛错都由同一失败出口承接。
    props.onActionErrorChange?.(null)
    let outcome: unknown
    try {
      outcome = props.onConfirm?.()
    }
    catch (cause) {
      settleConfirmError(service, props, token, 'invoking', cause)
      return
    }

    let then: ReturnType<typeof readThen>
    try {
      then = readThen(outcome)
    }
    catch (cause) {
      settleConfirmError(service, props, token, 'invoking', cause)
      return
    }

    if (!then) {
      const transaction = transactionOf(service)
      if (!tokenIsCurrent(service, token) || transaction.phase !== 'invoking')
        return
      transaction.phase = 'settling'
      try {
        // 点的是确认按钮，不是代码调的
        send({ type: 'CLOSE', src: 'close-trigger' })
      }
      finally {
        if (tokenOwnsTransaction(service, token)) {
          transaction.event = service.event.current()
          transaction.phase = 'idle'
        }
      }
      return
    }

    const transaction = transactionOf(service)
    if (tokenIsCurrent(service, token) && transaction.phase === 'invoking') {
      transaction.phase = 'pending'
      transaction.ignorePendingSnapshot = false
      props.onPendingChange?.(true)
    }
    // 即便 onConfirm 已同步取消或停机，也必须同化返回的 thenable 并承接拒绝；
    // 票据检查只禁止它写回状态，不能把已拒绝 Promise 留成 unhandled rejection。
    void assimilateThenable(outcome, then).then(
      () => {
        const current = transactionOf(service)
        if (!tokenIsCurrent(service, token) || current.phase !== 'pending')
          return
        current.phase = 'settling'
        try {
          props.onPendingChange?.(false)
          send({ type: 'CLOSE', src: 'close-trigger' })
        }
        finally {
          if (tokenOwnsTransaction(service, token)) {
            current.event = service.event.current()
            current.phase = 'idle'
          }
        }
      },
      (cause) => {
        settleConfirmError(service, props, token, 'pending', cause)
      },
    )
  }

  const cancel = (): void => {
    // 取消只终止本组件等待，不声称能取消业务 Promise；批次号令它的迟到结果失效。
    const transaction = transactionOf(service)
    const wasPending = isPending()
    transaction.revision += 1
    transaction.phase = 'idle'
    transaction.ignorePendingSnapshot = wasPending
    if (wasPending)
      props.onPendingChange?.(false)
    props.onActionErrorChange?.(null)
    try {
      props.onCancel?.()
    }
    finally {
      send({ type: 'CLOSE', src: 'close-trigger' })
      transaction.event = service.event.current()
    }
  }

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
      // 页面上的独立文字按钮：盒型、四态面、0.97 按压与粗指针命中区由家族配方按 text 档给出（§4.1 / §9.1）；
      // 缺省 outline 描边（§7.2 第 2 条：只有 Button 缺省品牌实心）。作者以 asChild 换成自己的按钮时，
      // 这几条家族标记不落到它身上（适配器合并时跳过 data-xh-*）
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'md',
      'data-xh-action-variant': 'outline',
      ...press('trigger'),
      'onClick': () => setOpen(!open),
    }),
    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
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
      'id': ids.content,
      // Popconfirm 是不陷焦点、不锁页面的非模态确认面；dialog 与这份交互合同一致。
      'role': 'dialog',
      'tabindex': -1,
      // Presence 会把收起内容留到动画结束；这段期间必须先退出焦点树与交互树。
      'inert': !open || undefined,
      'aria-hidden': !open || undefined,
      'aria-labelledby': ids.title,
      'aria-describedby': ids.description,
      'data-state': stateAttr,
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
      // 确认是本浮层的主要动作，与 Button 主动作同待遇：text 档 sm、显式 solid（§7.2 第 2 条），
      // 语气由 content 上的 data-tone 经 --xh-_tone 下发；挂起期间家族的 loading 面接管 hover / pressed
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'sm',
      'data-xh-action-variant': 'solid',
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
