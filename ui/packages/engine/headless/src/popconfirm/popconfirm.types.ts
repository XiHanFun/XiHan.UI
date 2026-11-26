/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 popconfirm 类型契约。

import type { PropTypes } from '@xihan-ui/core'
import type { PopoverOpenChangeDetails, PopoverSchema } from '../popover/popover.types'

/**
 * 开合与浮层部分与 popover 相同：气泡确认运行的即 popover 状态机，initialFocus / restoreFocus、
 * lazyMount / unmountOnExit 与 flip / boundary 一并沿用；两个开合回调 onOpenChange、onExitComplete 归 PopconfirmNotifiers。
 * 去除三项：modal（气泡确认不陷入焦点）、translations（popover 的那份是关闭钮的名字，气泡确认没有关闭钮；
 * 自己的文案见 PopconfirmTranslations）与 anchor（确认气泡总是贴着发起这次操作的触发器）。
 */
export type PopconfirmOverlayProps = Omit<PopoverSchema['props'], 'modal' | 'translations' | 'onOpenChange' | 'onExitComplete' | 'anchor'>

/** 确认动作失败；cause 保留回调同步抛出或 thenable 拒绝时的原值。 */
export interface PopconfirmConfirmErrorDetails {
  cause: unknown
}

/** 对外回调。 */
export interface PopconfirmNotifiers {
  /** open 变化意图；受控时是唯一出口，非受控时随内部转移一并通知。 */
  onOpenChange?: (details: PopoverOpenChangeDetails) => void
  /**
   * 点击了确认按钮。返回 thenable 即挂起确认门：浮层等待它兑现才收起、
   * 确认按钮转圈且再次点击无效，拒绝则留在原地并报告确认错误。同步返回照常立即收起。
   */
  onConfirm?: () => void | PromiseLike<unknown>
  /** 确认回调同步抛出或 thenable 拒绝；details.cause 是未经包装的原始原因。 */
  onConfirmError?: (details: PopconfirmConfirmErrorDetails) => void
  /** 点击了取消按钮，随后浮层收起；挂起中的确认结果随之作废。Escape 与层外交互只发 onOpenChange，不发该回调。 */
  onCancelPress?: () => void
  /** 退场动画播完（或没有退场动画），且本层资源全部释放后通知；卸载和退场途中重开不通知。 */
  onExitComplete?: () => void
}

/** 确认动作的挂起通道：布尔由适配器持有并回传，connect 只发变化意图。 */
export interface PopconfirmPendingChannel {
  /** 异步确认进行中。 */
  pending?: boolean
  onPendingChange?: (pending: boolean) => void
}

/** 确认错误由适配器持有；null 表示当前没有确认动作错误。 */
export interface PopconfirmActionErrorChannel {
  actionError?: PopconfirmConfirmErrorDetails | null
  onActionErrorChange?: (error: PopconfirmConfirmErrorDetails | null) => void
}

/** connect 使用的部分：确认与取消不改变开合以外的状态，因此不进入状态机，由 connect 直接转交。 */
export type PopconfirmIntents = Pick<PopconfirmNotifiers, 'onConfirm' | 'onConfirmError' | 'onCancelPress'>
  & PopconfirmPendingChannel
  & PopconfirmActionErrorChannel

export type PopconfirmProps = PopconfirmOverlayProps & PopconfirmNotifiers & {
  /** 标准结构里两颗钮的缺省文字；手写部件时按钮文字是作者写在节点里的内容，不读它。 */
  translations?: Partial<PopconfirmTranslations>
}

export interface PopconfirmApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 异步确认进行中：确认按钮转圈、再次点击无效。 */
  pending: boolean
  /** 最近一次有效确认动作的错误；新确认或取消时清空。 */
  actionError: PopconfirmConfirmErrorDetails | null
  setOpen: (next: boolean) => void
  /** 发出确认意图并请求收起；异步确认挂起期间再次调用无效。 */
  confirm: () => void
  /** 发出取消意图并请求收起。 */
  cancel: () => void
  getRootProps: () => T['element']
  getTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getConfirmTriggerProps: () => T['button']
  getCancelTriggerProps: () => T['button']
  getArrowProps: () => T['element']
  /**
   * content 里的内容此刻该不该挂载。`present` 是适配器的退场闸门：打开中或收起动画还没播完为真。
   * 缺省恒为真；lazyMount 下没打开过为假；unmountOnExit 下闸门落下（退场播完）即为假。
   * positioner 与 content 节点不受它管，一向常驻。
   */
  isContentMounted: (present: boolean) => boolean
}

/** 标准结构里两颗钮的缺省文字；手写部件时按钮文字归作者。 */
export interface PopconfirmTranslations {
  /** 确认钮。 */
  ok: string
  /** 取消钮。 */
  cancel: string
}
