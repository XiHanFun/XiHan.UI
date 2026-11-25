/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 受控开合：open 给定时用户事件只发意图、不自改状态，宿主写回 open 之后由 watch 派发 CONTROLLED.* 落到状态上。
// 这一套判定与回调在每个带 open 的机器里逐字相同，收在这里；各机器的转移表照旧自己写。

import type { ActionFn, GuardFn, MachineSchema, OverlayCloseReason } from '@xihan-ui/core'
import type { CloseEventLike, CloseReasonExtra } from './close-reason'
import { closeReasonOf } from './close-reason'

/** 有受控位 open 的机器：判定与回写用得上。 */
export interface ControlledOpenStateSchema extends MachineSchema {
  props: {
    open?: boolean
  }
}

/** 开合回调也是标准形状（明细只有 open 与可选的关闭原因）的机器：三个 action 都用得上。 */
export interface ControlledOpenSchema extends ControlledOpenStateSchema {
  props: {
    open?: boolean
    onOpenChange?: (details: { open: boolean, reason?: OverlayCloseReason }) => void
  }
}

/** 受控位判定：给了 open 就是受控。 */
export function controlledOpenGuards<S extends ControlledOpenStateSchema>(): Record<'isOpenControlled', GuardFn<S>> {
  return {
    isOpenControlled: ({ prop }) => prop('open') !== undefined,
  }
}

/**
 * 把宿主写回的 open 翻成 CONTROLLED.OPEN / CONTROLLED.CLOSE，挂在 watch 上：
 * `track([() => prop('open')], () => action(['syncOpen']))`。
 * 只在受控（open 是布尔）时回写；open 变回 undefined 即转为非受控，不强制收起。
 * 开合回调的明细不是标准形状的机器（另带必填字段）只取这一个，回调自己写。
 */
export function controlledOpenSync<S extends ControlledOpenStateSchema>(): Record<'syncOpen', ActionFn<S>> {
  return {
    syncOpen: ({ prop, send }) => {
      const open = prop('open')
      if (open === undefined)
        return
      send({ type: open ? 'CONTROLLED.OPEN' : 'CONTROLLED.CLOSE' } as S['event'])
    },
  }
}

/**
 * 开合的三个 action：invokeOnOpen / invokeOnClose 把意图交给宿主，reason 为真时收起带上关闭原因
 * （由当前事件翻出，见 closeReasonOf；extra 补本机器的专有出口，比如悬停移开、失焦）；syncOpen 见 controlledOpenSync。
 *
 * 展开到 actions 的最前面；个别机器要改其中一个（多一条不回写的条件、事件名不同），在后面写同名成员盖掉即可。
 */
export function controlledOpenActions<S extends ControlledOpenSchema>(
  options: { reason?: boolean, extra?: CloseReasonExtra } = {},
): Record<'invokeOnOpen' | 'invokeOnClose' | 'syncOpen', ActionFn<S>> {
  return {
    invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
    invokeOnClose: options.reason
      ? ({ prop, event }) => prop('onOpenChange')?.({ open: false, reason: closeReasonOf(event.current() as CloseEventLike, options.extra) })
      : ({ prop }) => prop('onOpenChange')?.({ open: false }),
    ...controlledOpenSync<S>(),
  }
}
