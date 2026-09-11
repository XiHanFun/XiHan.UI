import type { PropTypes } from '@xihan-ui/core'
import type { PopoverOpenChangeDetails, PopoverSchema } from '../popover'

/**
 * 开合与浮层那部分与 popover 同款——气泡确认跑的就是 popover 机器。
 * 剔掉两项：modal（气泡确认不陷焦点）与 translations（两颗按钮的文案是作者写在节点里的内容）。
 */
export type PopconfirmOverlayProps = Omit<PopoverSchema['props'], 'modal' | 'translations' | 'onOpenChange'>

/** 确认动作失败；cause 保留回调同步抛出或 thenable 拒绝时的原值。 */
export interface PopconfirmConfirmErrorDetails {
  cause: unknown
}

/** 对外回调。 */
export interface PopconfirmNotifiers {
  /** open 变化意图；受控时是唯一出口，非受控时随内部转移一并通知。 */
  onOpenChange?: (details: PopoverOpenChangeDetails) => void
  /**
   * 点了确认按钮。返回 thenable 即挂起确认门：浮层等它兑现才收起、
   * 确认按钮转圈且再点无效，拒绝则留在原地并报告确认错误。同步返回照旧立即收起。
   */
  onConfirm?: () => void | PromiseLike<unknown>
  /** 确认回调同步抛出或 thenable 拒绝；details.cause 是未经包装的原始原因。 */
  onConfirmError?: (details: PopconfirmConfirmErrorDetails) => void
  /** 点了取消按钮，随后浮层收起；挂起中的确认结果随之作废。Escape 与层外交互只发 onOpenChange，不发这条。 */
  onCancel?: () => void
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

/** connect 用得上的部分：确认与取消不改开合以外的状态，因此不入机器，由 connect 直接转交。 */
export type PopconfirmIntents = Pick<PopconfirmNotifiers, 'onConfirm' | 'onConfirmError' | 'onCancel'>
  & PopconfirmPendingChannel
  & PopconfirmActionErrorChannel

export type PopconfirmProps = PopconfirmOverlayProps & PopconfirmNotifiers

export interface PopconfirmApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 异步确认进行中：确认按钮转圈、再点无效。 */
  pending: boolean
  /** 最近一次有效确认动作的错误；新确认或取消时清空。 */
  actionError: PopconfirmConfirmErrorDetails | null
  setOpen: (next: boolean) => void
  /** 发确认意图并请求收起；异步确认挂起期间再调无效。 */
  confirm: () => void
  /** 发取消意图并请求收起。 */
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
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface PopconfirmTranslations {}
