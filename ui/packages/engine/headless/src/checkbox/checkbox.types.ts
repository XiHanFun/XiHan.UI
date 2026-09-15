/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 checkbox 类型契约。

import type { MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

/**
 * 三态。半选是由外部数据计算出的显示态，不是用户可以切换进入的态：
 * 一组子项勾选了一部分时父项显示半选，点击它只会走向全选或全不选。
 */
export type CheckboxCheckedState = boolean | 'indeterminate'

/** 视觉变体：primary 是默认的实体控制盒，secondary 用于已有表面的低强调场景。 */
export type CheckboxVariant = 'primary' | 'secondary'

export interface CheckboxCheckedChangeDetails {
  /** 用户交互的落点只可能是全选或全不选，半选不在其中。 */
  checked: boolean
}

export interface CheckboxSchema extends MachineSchema {
  props: {
    checked?: CheckboxCheckedState
    defaultChecked?: CheckboxCheckedState
    disabled?: boolean
    /** 只读：不可勾选，但仍可聚焦、仍参与提交，对比度不降低。 */
    readOnly?: boolean
    /** 校验失败：只改变呈现，不阻止交互。 */
    invalid?: boolean
    /** 必填：随表单校验一起使用，只发无障碍属性，不自行拦截提交。 */
    required?: boolean
    /** 表单字段名；提供后 hidden-input 才带 name 并参与提交。 */
    name?: string
    /** 提交的值，默认 'on'，与原生复选框一致。 */
    value?: string
    /** 语气：brand / neutral / success / warning / danger / info，决定选中态使用哪族颜色。 */
    tone?: Tone
    /** 视觉变体：primary / secondary。默认 primary。 */
    variant?: CheckboxVariant
    /** 尺寸：sm / md / lg，决定方框边长与勾选符号的字号档位。 */
    size?: Size
    /** checked 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onCheckedChange?: (details: CheckboxCheckedChangeDetails) => void
  }
  context: Record<string, never>
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'off' | 'on' | 'indeterminate'
  event:
    // 点击那一路：off → on、on → off，半选按 APG 的父项约定一律走向全选
    | { type: 'TOGGLE' }
    // 命令式设值：setChecked 走这两条，避免半选态下 TOGGLE 表达不了「设为全不选」
    | { type: 'CHECK' }
    | { type: 'UNCHECK' }
    // 受控回写：宿主改 checked 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.ON' }
    | { type: 'CONTROLLED.OFF' }
    | { type: 'CONTROLLED.INDETERMINATE' }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'isCheckedControlled' | 'defaultsToChecked' | 'defaultsToIndeterminate'
  action: 'invokeOnCheck' | 'invokeOnUncheck' | 'syncChecked' | 'invokeReset'
  effect: never
}

export interface CheckboxApi<T extends PropTypes = PropTypes> {
  checked: CheckboxCheckedState
  /** 半选只能由 checked prop 给出，这里只接受全选 / 全不选。 */
  setChecked: (next: boolean) => void
  getRootProps: () => T['button']
  getIndicatorProps: () => T['element']
  /** 表单影子：勾选后才提交，半选按未勾选处理。提供 name 后才带 name。 */
  getHiddenInputProps: () => T['input']
  /** 包裹方框与文字的 <label>：点击文字即切换，方框的可及名来自文字。只在带文字时渲染。 */
  getLabelProps: () => T['label']
  /** 方框旁的文字。 */
  getTextProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface CheckboxTranslations {}
