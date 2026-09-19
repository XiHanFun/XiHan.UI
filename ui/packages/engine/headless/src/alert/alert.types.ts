/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 alert 类型契约。

import type { MachineSchema, PropTypes, Tone } from '@xihan-ui/core'

export interface AlertOpenChangeDetails {
  open: boolean
}

/** 读屏文案。默认英文，与 dialog / toast 的 translations 写法一致。 */
export interface AlertTranslations {
  close: string
}

export interface AlertSchema extends MachineSchema {
  props: {
    /**
     * 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色，默认 info。
     * danger / warning 使用 role="alert"，其余使用 role="status"。
     */
    tone?: Tone
    /** 关闭按钮是否可用，默认 true。false 时该按钮同时被禁用与收起。 */
    closable?: boolean
    /** 受控显隐；未提供该 prop 即非受控。 */
    open?: boolean
    /** 非受控初始显隐，默认显示。 */
    defaultOpen?: boolean
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: AlertOpenChangeDetails) => void
    translations?: Partial<AlertTranslations>
  }
  context: {
    /**
     * 按压通道：关闭按钮被 Space / Enter 或触屏手指按住期间为 true，该部件投影 data-pressed。
     * 抬起、失焦、指针取消，或提示收起（按钮随之隐藏）时撤下。
     */
    pressed: boolean
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'CLOSE' }
    // 受控回写：宿主改 open 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    /** 按压通道（shared/press）：关闭按钮被 Space / Enter 或触屏按住。 */
    | { type: 'PRESS.START' }
    /** 关闭按钮抬起、失焦或指针取消。 */
    | { type: 'PRESS.END' }
  tag: never
  guard: 'isOpenControlled' | 'canPress'
  action: 'invokeOnOpen' | 'invokeOnClose' | 'syncOpen' | 'startPress' | 'endPress' | 'releaseWhenInert'
  effect: never
}

export interface AlertApi<T extends PropTypes = PropTypes> {
  open: boolean
  tone: string
  closable: boolean
  setOpen: (next: boolean) => void
  getRootProps: () => T['element']
  getIndicatorProps: () => T['element']
  /** 文本列容器：标题与说明纵向排列。 */
  getContentProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  /** 操作槽：划定按钮区，按钮本身由作者提供。 */
  getActionProps: () => T['element']
  getCloseTriggerProps: () => T['button']
}
