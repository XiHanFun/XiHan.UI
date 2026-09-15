/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 text field 类型契约。

import type { ControlVariant, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

export interface TextFieldValueChangeDetails {
  /** 输入框中的原始串；提交进 FormData 的即它。 */
  value: string
}

/** 输入框渲染的标签：单行 input（默认）或多行 textarea。 */
export type TextFieldInputHost = 'input' | 'textarea'

/**
 * 单行宿主的输入类型。只接受文本类的几种：
 * checkbox / radio / file / range 等有自身的值语义与部件，不由本组件承担。
 */
export type TextFieldType = 'text' | 'password' | 'email' | 'tel' | 'url' | 'search'

/** 自动高度的行数界限；未提供时完全跟随内容。 */
export interface TextFieldAutoSize {
  /** 最少行数；提供时必须是大于等于 1 的有限整数。 */
  minRows?: number
  /** 最多行数；提供时必须是大于等于 1 的有限整数，且不得小于 minRows。 */
  maxRows?: number
}

/** 输入部件声明宿主标签，connect 据此决定是否写入 type 并接入自动高度。 */
export interface TextFieldInputProps {
  /** 默认 input。 */
  as?: TextFieldInputHost
}

export interface TextFieldSchema extends MachineSchema {
  props: {
    /** 受控值；提供后由宿主决定，状态机不自行修改。 */
    value?: string
    /** 非受控初值。 */
    defaultValue?: string
    /** 单行宿主的输入类型，默认 text；as 为 textarea 时不发该属性。 */
    type?: TextFieldType
    placeholder?: string
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    invalid?: boolean
    /** 表单字段名；提供后才参与提交。 */
    name?: string
    /** 字符数上限。同时落为原生 maxlength 与状态机侧的截断，两者都需要。 */
    maxLength?: number
    /** 开启清空能力：有值时显示清空按钮、Escape 接管。关闭时按钮带 hidden 收起。 */
    clearable?: boolean
    /** 显示字数部件：关闭时 count 部件带 hidden 收起。 */
    showCount?: boolean
    /** 多行宿主的自动高度：按横向书写的真实行盒随内容增高；对象形态固定行数上下限。 */
    autoSize?: boolean | TextFieldAutoSize
    /** 形态：outline / subtle / ghost，决定底色与描边的绘制方式。默认 outline。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦强调使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定输入框与清空按钮的几何档位。 */
    size?: Size
    /** 读屏文案；默认英文。 */
    translations?: Partial<TextFieldTranslations>
    onValueChange?: (details: TextFieldValueChangeDetails) => void
  }
  context: {
    value: string
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 单态：本组件没有任何随时间推移的过程，值本身存放在 context cell 中。 */
  state: 'idle'
  event:
    /** 用户输入或作者调用 setValue；超过 maxLength 的部分在这里截断。 */
    | { type: 'VALUE.SET', value: string }
    /** 清空意图（Escape 或清空按钮）；不满足清空条件时整条被守卫拦截。 */
    | { type: 'VALUE.CLEAR' }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'canEdit' | 'canClear'
  action: 'setValue' | 'clearValue' | 'resetToDefault'
  effect: never
}

export interface TextFieldApi<T extends PropTypes = PropTypes> {
  value: string
  /** 值为空串。作者据此显示占位说明等内容。 */
  empty: boolean
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  clearable: boolean
  /** 已到达 maxLength：无法再输入，作者据此把字数提示标红。 */
  atLimit: boolean
  /** 当前字数，即 value 的长度。作者用它渲染 count 部件中的数字。 */
  count: number
  /** 字数上限的原样透传；未设上限时为 undefined，此时只渲染当前字数。 */
  maxLength: number | undefined
  /** 字数部件当前是否显示（开启了 showCount）。 */
  showCount: boolean
  /** 清空按钮当前是否可用（开启 clearable、可编辑、且有值）。 */
  canClear: boolean
  /** 直接写值，只受 disabled / readOnly 与 maxLength 约束，与 clearable 无关。 */
  setValue: (next: string) => void
  /** 发起清空意图，受 canClear 约束；无条件清空使用 setValue('')。 */
  clear: () => void
  /** 自动高度配置的原样透传；适配器在程序化写值后据此补测一次。 */
  autoSize: boolean | TextFieldAutoSize
  getRootProps: () => T['element']
  /** 视觉盒；提供后由它绘制描边与聚焦环，未提供时输入框自身作为盒。 */
  getControlProps: () => T['element']
  getLabelProps: () => T['label']
  /** 传 as: 'textarea' 即多行宿主：去除 type、接入自动高度。 */
  getInputProps: (props?: TextFieldInputProps) => T['input']
  /** 输入框前的装饰段（货币符、单位、图标）；对读屏隐藏，不参与名字链。 */
  getPrefixProps: () => T['element']
  /** 输入框后的装饰段；对读屏隐藏，不参与名字链。 */
  getSuffixProps: () => T['element']
  getClearTriggerProps: () => T['button']
  /** 字数部件：承载 count / maxLength 两个数字，未开启 showCount 时带 hidden 收起。 */
  getCountProps: () => T['element']
}

/** 读屏文案，默认英文。 */
export interface TextFieldTranslations {
  /** 清空按钮的名字。 */
  clearTrigger: string
}
