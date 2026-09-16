/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 toggle 类型契约。

import type { ActionVariant, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

export interface TogglePressedChangeDetails {
  pressed: boolean
}

export interface ToggleSchema extends MachineSchema {
  props: {
    pressed?: boolean
    defaultPressed?: boolean
    disabled?: boolean
    /** 变体：solid / subtle / outline / ghost。 */
    variant?: ActionVariant
    /** 颜色：brand / neutral / success / warning / danger / info。 */
    tone?: Tone
    /** 尺寸：sm / md / lg */
    size?: Size
    /**
     * 仅图标：左右内边距清零、宽高相等。宽度跟随当前尺寸档的高度，
     * 不必把档位写进行内样式。图标按钮没有可见文字，作者须自行提供可及名。
     */
    iconOnly?: boolean
    /** 撑满行宽：工具条中的一列开关常用。 */
    fullWidth?: boolean
    /** pressed 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onPressedChange?: (details: TogglePressedChangeDetails) => void
  }
  context: {
    /**
     * 正被按住：Space / Enter 或触屏手指按下到松开之间。它是瞬态的按压面（投影 data-pressed），
     * 与 props 里的 pressed（开关的 on / off，投影 aria-pressed）是两件事。
     */
    pressed: boolean
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'off' | 'on'
  event:
    | { type: 'TOGGLE' }
    // 受控回写：宿主改 pressed 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.ON' }
    | { type: 'CONTROLLED.OFF' }
    // 按压通道（shared/press）：Space / Enter 或触屏按住与松开
    | { type: 'PRESS.START' }
    | { type: 'PRESS.END' }
  tag: never
  guard: 'isPressedControlled' | 'canPress'
  action: 'invokeOnPress' | 'invokeOnUnpress' | 'syncPressed' | 'startPress' | 'endPress' | 'releaseWhenDisabled'
  effect: never
}

export interface ToggleApi<T extends PropTypes = PropTypes> {
  pressed: boolean
  setPressed: (next: boolean) => void
  getRootProps: () => T['button']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface ToggleTranslations {}
