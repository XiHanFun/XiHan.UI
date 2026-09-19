/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 tag 类型契约。

import type { MachineSchema, PressHandlers, PropTypes, Size, Tone } from '@xihan-ui/core'

/** 形态。取值与 tag.css 的选择器一一对应。 */
export type TagVariant = 'ghost' | 'outline' | 'solid' | 'subtle'

/**
 * 按压通道里正被按住的部件：close-trigger 是自家的关闭钮；root 由把标签当条目用的宿主（tag-group 的可选行）按住，
 * 单独使用的标签不接收焦点，root 只在触屏按下时进来。
 */
export type TagPressedPart = 'root' | 'close-trigger'

/**
 * 宿主替静态标签供给的按压通道：真源在宿主的机器里，标签只投影 data-pressed 并把处理器合成到部件上。
 * connectStaticTag 未提供它时两个部件都不接按压。
 */
export interface TagPressPort {
  /** 正被按住的部件；没有按住时为 null。 */
  pressed: TagPressedPart | null
  /** 合成到该部件 getter 上的处理器。 */
  handlers: (part: TagPressedPart) => PressHandlers
}

export interface TagOpenChangeDetails {
  open: boolean
}

/** 读屏文案，默认英文。 */
export interface TagTranslations {
  /**
   * 关闭按钮的 aria-label：按钮内通常只有一个叉，读屏无法朗读移除的是哪一个标签。
   * 默认 'Delete'，与 select、tags-input 中同一动作使用同一个词。
   */
  close: string
}

export interface TagSchema extends MachineSchema {
  props: {
    /** 形态：solid / subtle / outline / ghost，决定颜色的使用方式。 */
    variant?: TagVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /** 是否提供关闭按钮，默认 false。false 时该按钮同时被禁用与收起。 */
    closable?: boolean
    /** 标签禁用：关闭按钮不可用，点击不改变显隐。 */
    disabled?: boolean
    /** 只读：关闭按钮保留位置但不可按下，标签本身不置灰。 */
    readOnly?: boolean
    /** 受控显隐；未提供该 prop 即非受控。 */
    open?: boolean
    /** 非受控初始显隐，默认显示。 */
    defaultOpen?: boolean
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: TagOpenChangeDetails) => void
    translations?: Partial<TagTranslations>
  }
  context: {
    /**
     * 按压通道：Space / Enter 或触屏手指按下到松开之间正被按住的部件，该部件投影 data-pressed；没有按住时为 null。
     * 禁用与只读时谁都不进，关闭钮还要 closable；收起时一并松开（钮随标签一起 hidden，不会再来 keyup）。
     */
    pressed: TagPressedPart | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'CLOSE' }
    // 受控回写：宿主改 open 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSED' }
    // 按压通道（shared/press）：Space / Enter 或触屏按住与松开，part 说的是哪一个部件
    | { type: 'PRESS.START', part: TagPressedPart }
    | { type: 'PRESS.END', part: TagPressedPart }
  tag: never
  guard: 'isOpenControlled' | 'canPress'
  action: 'invokeOnOpen' | 'invokeOnClose' | 'syncOpen' | 'startPress' | 'endPress' | 'releaseWhenInert' | 'releasePress'
  effect: never
}

export interface TagApi<T extends PropTypes = PropTypes> {
  open: boolean
  closable: boolean
  disabled: boolean
  setOpen: (next: boolean) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getCloseTriggerProps: () => T['button']
}
