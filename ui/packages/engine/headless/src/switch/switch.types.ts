/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 switch 类型契约。

import type { MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

export interface SwitchCheckedChangeDetails {
  checked: boolean
}

export interface SwitchSchema extends MachineSchema {
  props: {
    checked?: boolean
    defaultChecked?: boolean
    disabled?: boolean
    /** 只读：不可切换，但仍可聚焦、仍参与提交，对比度不降低。 */
    readOnly?: boolean
    /** 校验失败：只改变呈现，不阻止交互。 */
    invalid?: boolean
    /** 必填：随表单校验一起使用，只发无障碍属性，不自行拦截提交。 */
    required?: boolean
    /** 提交中：交互挂起、滑块转圈，但不呈现为禁用（仍可聚焦、对比度不降）。 */
    loading?: boolean
    /** 表单字段名；提供后 hidden-input 才带 name 并参与提交。 */
    name?: string
    /** 提交的值，默认 'on'，与原生复选框一致。 */
    value?: string
    /** 语气：brand / neutral / success / warning / danger / info，决定选中态轨道使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定轨道与滑块的几何档位。 */
    size?: Size
    /** checked 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onCheckedChange?: (details: SwitchCheckedChangeDetails) => void
  }
  context: {
    /** 按压通道：Space / Enter 或触屏按住期间为 true，root 投影 data-pressed；抬起、失焦或指针取消即复位。与开关态无关。 */
    pressed: boolean
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'off' | 'on'
  event:
    | { type: 'TOGGLE' }
    // 受控回写：宿主改 checked 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.ON' }
    | { type: 'CONTROLLED.OFF' }
    | { type: 'FORM.RESET' }
    // 按压通道（shared/press）：Space / Enter 或触屏按住与松开
    | { type: 'PRESS.START' }
    | { type: 'PRESS.END' }
  tag: never
  guard: 'isCheckedControlled' | 'defaultsToChecked' | 'canPress'
  action:
    | 'invokeOnCheck'
    | 'invokeOnUncheck'
    | 'syncChecked'
    | 'invokeReset'
    | 'startPress'
    | 'endPress'
    | 'releaseWhenInert'
  effect: never
}

export interface SwitchApi<T extends PropTypes = PropTypes> {
  checked: boolean
  /** 提交中。 */
  loading: boolean
  setChecked: (next: boolean) => void
  getRootProps: () => T['button']
  getThumbProps: () => T['element']
  /** 表单影子：开启后才提交。提供 name 后才带 name，未提供时不参与提交。 */
  getHiddenInputProps: () => T['input']
  /** 包裹轨道与文字的 <label>：点击文字即切换，轨道的可及名来自文字。只在带文字时渲染。 */
  getLabelProps: () => T['label']
  /** 轨道旁的文字。 */
  getTextProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface SwitchTranslations {}
