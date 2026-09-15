/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 color field 类型契约。

import type { ControlVariant, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'
import type { ColorFormat, ColorRgba } from '../shared/color'

export interface ColorFieldValueChangeDetails {
  /** 按 format 序列化的颜色串；空串表示没有颜色。 */
  value: string
}

export interface ColorFieldSchema extends MachineSchema {
  props: {
    /** 受控的颜色串；提供后由宿主决定，状态机不自行修改。空串表示没有颜色。 */
    value?: string
    /** 非受控初值，默认空串。 */
    defaultValue?: string
    /** 值串的写法，默认 hex。手动输入的任何写法接受后都按它重写。 */
    format?: ColorFormat
    /** 带透明度，默认关闭。关闭时接受的颜色恒为不透明。 */
    alpha?: boolean
    placeholder?: string
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    invalid?: boolean
    /** 表单字段名；提供后才参与提交（经表单影子，输入框中未提交的草稿不会被提交）。 */
    name?: string
    /** 开启清空能力：有值时显示清空按钮、Escape 接管。关闭时按钮带 hidden 收起。 */
    clearable?: boolean
    /** 形态：outline / subtle / ghost，决定底色与描边的绘制方式。默认 outline。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦强调使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定输入框、色块与清空按钮的几何档位。 */
    size?: Size
    /** 读屏文案；默认英文。 */
    translations?: Partial<ColorFieldTranslations>
    onValueChange?: (details: ColorFieldValueChangeDetails) => void
  }
  context: {
    /** 颜色串。受控（value 提供）时 cell 直读 prop。 */
    value: string
    /** 输入框中尚未接受的草稿；null = 无人编辑，输入框显示规范文本。 */
    draft: string | null
    /** 上一次接受失败：草稿留在框中并标为无效，直到修改或接受成功。 */
    draftInvalid: boolean
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 单态：本组件没有任何随时间推移的过程，值与草稿存放在 context cell 中。 */
  state: 'idle'
  event:
    /** 用户在框中输入：保留草稿，不修改值。 */
    | { type: 'INPUT.CHANGE', value: string }
    /** 接受草稿（回车或失焦）：可解析时按 format 重写为值，不可解析时保留草稿并标为无效。 */
    | { type: 'INPUT.COMMIT' }
    /** 放弃草稿（Escape）：框中回到当前值的规范文本。 */
    | { type: 'INPUT.CANCEL' }
    /** 作者调用 setValue：空串清空，不可解析的串保持不变。 */
    | { type: 'VALUE.SET', value: string }
    /** 清空意图（Escape 或清空按钮）；不满足清空条件时整条被守卫拦截。 */
    | { type: 'VALUE.CLEAR' }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'canEdit' | 'canClear'
  action: 'setDraft' | 'commitDraft' | 'cancelDraft' | 'setValue' | 'clearValue' | 'resetToDefault'
  effect: never
}

export interface ColorFieldApi<T extends PropTypes = PropTypes> {
  /** 当前值串（与 onValueChange 发出的是同一个）；空串表示没有颜色。 */
  value: string
  /** 值为空串。 */
  empty: boolean
  /** 输入框当前应显示的文字：有草稿显示草稿，否则显示值本身。 */
  text: string
  /** 正在编辑：框中有一份尚未接受的草稿。 */
  editing: boolean
  /** 上一次接受失败，草稿留在框中。 */
  draftInvalid: boolean
  /** 值解析出的颜色；空串或不可解析时为兜底黑，此时参考 empty / valid。 */
  rgba: ColorRgba
  /** 值串本身可解析（空串不算有效）。 */
  valid: boolean
  disabled: boolean
  readOnly: boolean
  /** 作者标记的 invalid，或草稿不可接受。 */
  invalid: boolean
  clearable: boolean
  /** 清空按钮当前是否可用（开启 clearable、可编辑、且有值）。 */
  canClear: boolean
  /** 直接写值：空串清空，不可解析的串保持不变；只受 disabled / readOnly 约束。 */
  setValue: (next: string) => void
  /** 发起清空意图，受 canClear 约束；无条件清空使用 setValue('')。 */
  clear: () => void
  /** 接受框中的草稿（与回车 / 失焦同一路径）。 */
  commit: () => void
  getRootProps: () => T['element']
  /** 视觉盒；描边、底色与聚焦环绘制在该节点上，色块、输入框与清空按钮排列在其中。 */
  getControlProps: () => T['element']
  getLabelProps: () => T['label']
  /** 当前颜色的色块：纯装饰，颜色已在输入框中；空值或无效时只绘制棋盘格。 */
  getSwatchProps: () => T['element']
  getInputProps: () => T['input']
  getClearTriggerProps: () => T['button']
  /** 表单影子：提交的是已接受的值，框中的草稿不会被提交。提供 name 后才带 name。 */
  getHiddenInputProps: () => T['input']
}

/** 读屏文案，默认英文。 */
export interface ColorFieldTranslations {
  /** 清空按钮的名字。 */
  clearTrigger: string
}
