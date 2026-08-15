import type { PropTypes } from '@xihan-ui/kernel'
import type { PopoverOpenChangeDetails, PopoverSchema } from '../popover'

/**
 * 开合与浮层那部分与 popover 同款——气泡确认跑的就是 popover 机器。
 * 剔掉两项：modal（气泡确认不陷焦点）与 translations（两颗按钮的文案是作者写在节点里的内容）。
 */
export type PopconfirmOverlayProps = Omit<PopoverSchema['props'], 'modal' | 'translations' | 'onOpenChange'>

/** 对外的三个回调。 */
export interface PopconfirmNotifiers {
  /** open 变化意图；受控时是唯一出口，非受控时随内部转移一并通知。 */
  onOpenChange?: (details: PopoverOpenChangeDetails) => void
  /**
   * 点了确认按钮。返回 Promise 即挂起确认门：浮层等它兑现才收起、
   * 确认按钮转圈且再点无效，落空（reject）则留在原地不收。同步返回照旧立即收起。
   */
  onConfirm?: () => void | Promise<unknown>
  /** 点了取消按钮，随后浮层收起；挂起中的确认结果随之作废。Escape 与层外交互只发 onOpenChange，不发这条。 */
  onCancel?: () => void
}

/** 确认动作的挂起通道：布尔由适配器持有并回传，connect 只发变化意图。 */
export interface PopconfirmPendingChannel {
  /** 异步确认进行中。 */
  pending?: boolean
  onPendingChange?: (pending: boolean) => void
}

/** connect 用得上的部分：确认与取消不改开合以外的状态，因此不入机器，由 connect 直接转交。 */
export type PopconfirmIntents = Pick<PopconfirmNotifiers, 'onConfirm' | 'onCancel'> & PopconfirmPendingChannel

export type PopconfirmProps = PopconfirmOverlayProps & PopconfirmNotifiers

export interface PopconfirmApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 异步确认进行中：确认按钮转圈、再点无效。 */
  pending: boolean
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
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface PopconfirmTranslations {}
