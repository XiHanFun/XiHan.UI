/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 button 类型契约。

import type { ActionVariant, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

/** 根节点渲染的标签。 */
export type ButtonElement = 'button' | 'a'

export interface ButtonSchema extends MachineSchema {
  props: {
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    /** 加载态：用 aria-disabled + 拦截事件表达，保留焦点。 */
    loading?: boolean
    /** 变体：solid / subtle / outline / ghost。 */
    variant?: ActionVariant
    /** 颜色：brand / neutral / success / warning / danger / info。 */
    tone?: Tone
    size?: Size
    /**
     * 仅图标：左右内边距清零、宽高相等。宽度跟随当前尺寸档的高度，
     * 不必把档位写进行内样式。图标按钮没有可见文字，作者须自行提供可及名。
     */
    iconOnly?: boolean
    /**
     * 作者写在根节点上的可及名（aria-label / aria-labelledby）。
     * 宿主只把它们转告连接层，用于判断图标按钮是否有名字；属性本身仍由宿主写入根节点。
     */
    ariaLabel?: string
    ariaLabelledby?: string
    /** 撑满行宽：表单末尾的提交按钮与移动端常用。 */
    fullWidth?: boolean
    /**
     * 渲染的标签，默认 button。
     * 写为 a 时不再产出 type 与原生 disabled（两者在链接上无效），禁用改由 aria-disabled 表达，
     * 点击仍被拦截。href 由作者自行提供。
     */
    as?: ButtonElement
  }
  context: {
    /** 正被按住：Space / Enter 或触屏手指按下到松开之间，投影 data-pressed。指针按住由 :active 表出。 */
    pressed: boolean
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 按钮没有业务状态：激活交给平台，机器只承载按压面。 */
  state: 'idle'
  // 按压通道（shared/press）：Space / Enter 或触屏按住与松开
  event:
    | { type: 'PRESS.START' }
    | { type: 'PRESS.END' }
  tag: never
  guard: 'canPress'
  action: 'startPress' | 'endPress' | 'releaseWhenInert'
  effect: never
}

export type ButtonProps = ButtonSchema['props']

export interface ButtonApi<T extends PropTypes = PropTypes> {
  disabled: boolean
  loading: boolean
  getRootProps: () => T['button']
  getLabelProps: () => T['element']
  getIndicatorProps: () => T['element']
  getPrefixProps: () => T['element']
  getSuffixProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface ButtonTranslations {}
