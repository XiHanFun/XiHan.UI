import type { PropTypes } from '@xihan-ui/core'
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
  /** 点了确认按钮，随后浮层收起。 */
  onConfirm?: () => void
  /** 点了取消按钮，随后浮层收起。Escape 与层外交互只发 onOpenChange，不发这条。 */
  onCancel?: () => void
}

/** connect 用得上的那两个：确认与取消不改开合以外的状态，因此不入机器，由 connect 直接转交。 */
export type PopconfirmIntents = Pick<PopconfirmNotifiers, 'onConfirm' | 'onCancel'>

export type PopconfirmProps = PopconfirmOverlayProps & PopconfirmNotifiers

export interface PopconfirmApi<T extends PropTypes = PropTypes> {
  open: boolean
  setOpen: (next: boolean) => void
  /** 发确认意图并请求收起。 */
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
