/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 collapsible 类型契约。

import type { Direction, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

export interface CollapsibleOpenChangeDetails {
  open: boolean
}

export interface CollapsibleSchema extends MachineSchema {
  props: {
    open?: boolean
    defaultOpen?: boolean
    disabled?: boolean
    /** 颜色：brand / neutral / success / warning / danger / info，决定使用哪组状态色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /** 文字方向，只作用于排版；作者未提供时不写入。 */
    dir?: Direction
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: CollapsibleOpenChangeDetails) => void
  }
  context: {
    /**
     * 按压通道：trigger 被 Space / Enter 或触屏手指按住期间为 true，该部件投影 data-pressed。
     * 抬起、失焦、指针取消，或按住途中转为禁用时撤下；与开合互相独立。
     */
    pressed: boolean
    /**
     * 挂载之后开合变过没有。没变过时内容与箭头投影 data-instant：首帧就在的展开 / 收起直接呈现，
     * 不播展开、收起动画；第一次开合起才按动效走。
     */
    moved: boolean
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'CLOSE' }
    | { type: 'TOGGLE' }
    // 受控回写：宿主改 open 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    /** 按压通道（shared/press）：trigger 被 Space / Enter 或触屏按住。 */
    | { type: 'PRESS.START' }
    /** trigger 抬起、失焦或指针取消。 */
    | { type: 'PRESS.END' }
  tag: never
  guard: 'isOpenControlled' | 'canPress'
  action: 'invokeOnOpen' | 'invokeOnClose' | 'syncOpen' | 'startPress' | 'endPress' | 'releaseWhenInert' | 'markMoved'
  effect: never
}

export interface CollapsibleApi<T extends PropTypes = PropTypes> {
  open: boolean
  setOpen: (next: boolean) => void
  getRootProps: () => T['element']
  getHeaderProps: () => T['element']
  getTriggerProps: () => T['button']
  getContentProps: () => T['element']
  getIndicatorProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface CollapsibleTranslations {}
