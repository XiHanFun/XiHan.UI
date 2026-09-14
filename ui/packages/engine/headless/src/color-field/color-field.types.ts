/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 color field 类型契约。

import type { ControlVariant, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'
import type { ColorFormat, ColorRgba } from '../shared/color'

export interface ColorFieldValueChangeDetails {
  /** 按 format 序列化好的颜色串；空串表示没有颜色。 */
  value: string
}

export interface ColorFieldSchema extends MachineSchema {
  props: {
    /** 受控的颜色串；给了就由宿主说了算，机器不自改。空串表示没有颜色。 */
    value?: string
    /** 非受控初值，缺省空串。 */
    defaultValue?: string
    /** 值串的写法，默认 hex。手打的任何写法收下后都按它重写。 */
    format?: ColorFormat
    /** 带透明度，默认关。关掉时收下的颜色恒不透明。 */
    alpha?: boolean
    placeholder?: string
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    invalid?: boolean
    /** 表单字段名；给了才参与提交（经表单影子，输入框里的半截字不会被提交）。 */
    name?: string
    /** 开启清空能力：有值时显出清空按钮、Escape 接管。关掉时按钮带 hidden 收起。 */
    clearable?: boolean
    /** 形态：outline / subtle / ghost，决定输入框的底与描边怎么画。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦强调用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定输入框、色块与清空按钮的几何档位。 */
    size?: Size
    /** 读屏文案；缺省英文。 */
    translations?: Partial<ColorFieldTranslations>
    onValueChange?: (details: ColorFieldValueChangeDetails) => void
  }
  context: {
    /** 颜色串。受控（value 给定）时 cell 直读 prop。 */
    value: string
    /** 输入框里还没收下的半截字；null = 没人在编辑，输入框显示规范文本。 */
    draft: string | null
    /** 上一次收下失败：草稿留在框里并标成无效，直到改动或收下成功。 */
    draftInvalid: boolean
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 单态：这个组件没有任何随时间推移的过程，值与草稿住在 context cell 里。 */
  state: 'idle'
  event:
    /** 用户在框里打字：留下草稿，不动值。 */
    | { type: 'INPUT.CHANGE', value: string }
    /** 收下草稿（回车或失焦）：解析得了就按 format 重写成值，解析不了保留草稿并标成无效。 */
    | { type: 'INPUT.COMMIT' }
    /** 放弃草稿（Escape）：框里回到当前值的规范文本。 */
    | { type: 'INPUT.CANCEL' }
    /** 作者调 setValue：空串清空，解析不出的串原地不动。 */
    | { type: 'VALUE.SET', value: string }
    /** 清空意图（Escape 或清空按钮）；不满足清空条件时整条被守卫挡下。 */
    | { type: 'VALUE.CLEAR' }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'canEdit' | 'canClear'
  action: 'setDraft' | 'commitDraft' | 'cancelDraft' | 'setValue' | 'clearValue' | 'resetToDefault'
  effect: never
}

export interface ColorFieldApi<T extends PropTypes = PropTypes> {
  /** 当前值串（与 onValueChange 送出的是同一个）；空串表示没有颜色。 */
  value: string
  /** 值为空串。 */
  empty: boolean
  /** 输入框此刻该显示的字：有草稿显示草稿，否则显示值本身。 */
  text: string
  /** 正在编辑：框里有一份还没收下的草稿。 */
  editing: boolean
  /** 上一次收下失败，草稿留在框里。 */
  draftInvalid: boolean
  /** 值解析出来的颜色；空串或解析不出时是兜底黑，此时看 empty / valid。 */
  rgba: ColorRgba
  /** 值串本身解析得了（空串不算有效）。 */
  valid: boolean
  disabled: boolean
  readOnly: boolean
  /** 作者标的 invalid，或草稿收不下。 */
  invalid: boolean
  clearable: boolean
  /** 清空按钮此刻是否可用（开了 clearable、可编辑、且有值）。 */
  canClear: boolean
  /** 直接写值：空串清空，解析不出的串原地不动；只受 disabled/readOnly 约束。 */
  setValue: (next: string) => void
  /** 走清空意图，受 canClear 约束；无条件清空请用 setValue('')。 */
  clear: () => void
  /** 把框里的草稿收下（与回车 / 失焦同一条路）。 */
  commit: () => void
  getRootProps: () => T['element']
  /** 视觉盒；描边、底色与聚焦环画在这个节点上，色块、输入框与清空按钮排在它里面。 */
  getControlProps: () => T['element']
  getLabelProps: () => T['label']
  /** 当前颜色的色块：纯装饰，颜色已在输入框里；空值或无效时只画棋盘格。 */
  getSwatchProps: () => T['element']
  getInputProps: () => T['input']
  getClearTriggerProps: () => T['button']
  /** 表单影子：提交的是收下的值，框里的半截字不会被提交。给了 name 才带 name。 */
  getHiddenInputProps: () => T['input']
}

/** 读屏用的文案，默认英文。 */
export interface ColorFieldTranslations {
  /** 清空按钮的名字。 */
  clearTrigger: string
}
