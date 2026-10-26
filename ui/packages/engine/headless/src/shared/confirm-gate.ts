/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 确认门：浮层里「确定 / 取消」两个按钮的意图，气泡确认、对话框与抽屉共用。
// 确认与取消除了收起浮层不改任何状态，不进机器：由 connect 转给回调，再经各组件自己的收起出口关掉浮层。
// 回调返回 thenable 即挂起确认门：兑现才收起，拒绝留在原地并把原始原因报告出去；挂起期间另一次确认无效，
// 取消终止等待（不声称能取消业务 Promise，迟到的结果按批次号作废）。

import type { MachineSchema, Service } from '@xihan-ui/core'

/** 确认动作失败；cause 保留回调同步抛出或 thenable 拒绝时的原值。 */
export interface ConfirmErrorDetails {
  cause: unknown
}

/**
 * 确认门的意图与两个由适配器持有的状态通道：pending（异步确认进行中）与 actionError（最近一次确认的错误），
 * 布尔与错误对象由适配器持有并回传，connect 只发变化意图。
 */
export interface ConfirmIntents {
  /**
   * 点击了确认按钮。返回 thenable 即挂起确认门：浮层等待它兑现才收起、
   * 确认按钮转圈且再次点击无效，拒绝则留在原地并报告确认错误。同步返回照常立即收起。
   */
  onConfirm?: () => void | PromiseLike<unknown>
  /** 确认回调同步抛出或 thenable 拒绝；details.cause 是未经包装的原始原因。 */
  onConfirmError?: (details: ConfirmErrorDetails) => void
  /** 点击了取消按钮，随后浮层收起；挂起中的确认结果随之作废。Escape 与层外交互不发该回调。 */
  onCancelPress?: () => void
  /** 异步确认进行中。 */
  pending?: boolean
  onPendingChange?: (pending: boolean) => void
  /** 最近一次确认动作的错误；null 表示当前没有。 */
  actionError?: ConfirmErrorDetails | null
  onActionErrorChange?: (error: ConfirmErrorDetails | null) => void
}

export interface ConfirmGate {
  /** 异步确认挂起中：确认按钮转圈、再次点击无效。 */
  isPending: () => boolean
  /** 确认事务尚未落定（同步调用中、挂起中或正在收尾）：程序与触发器都不该从侧门收起浮层。 */
  isLocked: () => boolean
  /** 发出确认意图并在落定后收起。 */
  confirm: () => void
  /** 发出取消意图并收起；挂起中的确认作废。 */
  cancel: () => void
  /** 终止挂起中的确认但不发取消意图：关闭钮这类「不是取消钮」的收起出口用。不收起浮层。 */
  abort: () => void
}

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

type GateService = Service<MachineSchema>

// 一台服务同时只准有一项确认事务；同步 invoking 阶段也上锁，挡住回调重入与同拍连点。
const confirmTransactions = new WeakMap<object, ConfirmTransaction>()

function transactionOf(service: GateService): ConfirmTransaction {
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

function tokenOwnsTransaction(service: GateService, token: ConfirmToken): boolean {
  const transaction = confirmTransactions.get(service)
  return transaction?.owner === token.owner
    && transaction.revision === token.revision
}

function tokenIsCurrent(service: GateService, token: ConfirmToken): boolean {
  const transaction = confirmTransactions.get(service)
  return service.getStatus() === 'Started'
    && tokenOwnsTransaction(service, token)
    && Object.is(transaction?.event, service.event.current())
}

/**
 * connect 观察到机器接受过新的开合事件，就把旧确认事务作废。
 * 这也覆盖受控宿主在组件不卸载的情况下 close → open；事件对象身份不会发生 ABA。
 */
function reconcileActionSession(service: GateService, props: ConfirmIntents): ConfirmTransaction {
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

function beginConfirm(service: GateService, props: ConfirmIntents): ConfirmToken | null {
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
  service: GateService,
  props: ConfirmIntents,
  token: ConfirmToken,
  expectedPhase: 'invoking' | 'pending',
  cause: unknown,
): void {
  const transaction = transactionOf(service)
  if (!tokenIsCurrent(service, token) || transaction.phase !== expectedPhase)
    return
  transaction.phase = 'settling'
  const details: ConfirmErrorDetails = { cause }
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
 * 建一扇确认门。close 是组件自己的「按钮关闭」出口（发给机器的收起事件），确认兑现与取消都经它收起：
 * 先把意图交出去再请求收起——受控时收起要等宿主写回 open，两件事的先后不能反过来。
 */
export function createConfirmGate<S extends MachineSchema>(
  machine: Service<S>,
  props: ConfirmIntents,
  close: () => void,
): ConfirmGate {
  const service = machine as unknown as GateService

  const isPending = (): boolean => {
    const transaction = reconcileActionSession(service, props)
    return transaction.phase === 'pending' || (!!props.pending && !transaction.ignorePendingSnapshot)
  }
  const isLocked = (): boolean => {
    const transaction = reconcileActionSession(service, props)
    return transaction.phase !== 'idle' || (!!props.pending && !transaction.ignorePendingSnapshot)
  }

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
        close()
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
          close()
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

  /** 作废当前事务：批次号令迟到的结果失效，挂起的转圈撤掉，上一轮错误清空。 */
  const abort = (): void => {
    const transaction = transactionOf(service)
    const wasPending = isPending()
    transaction.revision += 1
    transaction.phase = 'idle'
    transaction.ignorePendingSnapshot = wasPending
    if (wasPending)
      props.onPendingChange?.(false)
    props.onActionErrorChange?.(null)
  }

  const cancel = (): void => {
    abort()
    const transaction = transactionOf(service)
    try {
      props.onCancelPress?.()
    }
    finally {
      close()
      transaction.event = service.event.current()
    }
  }

  return { isPending, isLocked, confirm, cancel, abort }
}
