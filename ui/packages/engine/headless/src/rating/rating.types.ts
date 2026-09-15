/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 rating 类型契约。

import type { Direction, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

export interface RatingValueChangeDetails {
  /** 已对齐到合法档位并夹进 [0, count] 的评分；0 表示尚未评分。 */
  value: number
}

export interface RatingHoverChangeDetails {
  /** 指针预览的档位；指针离开评分带时为 null。 */
  value: number | null
}

/**
 * 条目的声明：代表第几颗星（1 起）。
 * connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得反查 DOM。
 */
export interface RatingItemProps {
  value: number
}

/** 单个条目的呈现状态；自绘星形时按它取图案。 */
export interface RatingItemState {
  value: number
  /** 真实值落在这颗星上（读屏朗读的那一颗）。悬停预览不改变它。 */
  checked: boolean
  /** 这颗星应点亮。悬停期间跟随预览值。 */
  highlighted: boolean
  /** 这颗星只亮一半。 */
  half: boolean
}

export interface RatingSchema extends MachineSchema {
  props: {
    /** 受控评分。提供即受控：内部不再自行落值，只发 onValueChange。 */
    value?: number
    /** 非受控初值，默认 0（尚未评分）。 */
    defaultValue?: number
    /** 星星颗数，默认 5。 */
    count?: number
    /** 允许半颗星：档位从 1 变为 0.5。 */
    allowHalf?: boolean
    /** 再次点击当前档位即清零，键盘在最低档再向下一步同样清零；默认开启。 */
    allowClear?: boolean
    /** 完全不可交互：退出 Tab 序列，指针与键盘都不响应。 */
    disabled?: boolean
    /** 只读：仍可聚焦、仍能被读屏朗读，但不可修改，也不提供悬停预览。 */
    readOnly?: boolean
    required?: boolean
    /** 表单字段名；提供后表单影子才带 name 并参与提交。 */
    name?: string
    /** 文字方向，默认 'ltr'。只改写左右方向键与指针落在哪半边的语义。 */
    dir?: Direction
    /** 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    translations?: Partial<RatingTranslations>
    onValueChange?: (details: RatingValueChangeDetails) => void
    /** 悬停预览变化；指针离开时带 null。它不代表值已变化。 */
    onHoverChange?: (details: RatingHoverChangeDetails) => void
  }
  context: {
    /** 评分。受控（value 提供）时 cell 直读 prop，写入只发 onValueChange 不修改内部值。 */
    value: number
    /** 指针预览值，只影响点亮范围，不写入 value。指针离开即清空。 */
    hoveredValue: number | null
    /** 焦点所在的星序号（1 起），焦点离开评分带即清空。只服务 roving tabindex 与键盘起点。 */
    focusedValue: number | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'idle'
  event:
    | { type: 'VALUE.SET', value: number }
    | { type: 'VALUE.STEP', direction: 1 | -1 }
    | { type: 'VALUE.TO_MIN' }
    | { type: 'VALUE.TO_MAX' }
    | { type: 'ITEM.SELECT', value: number }
    | { type: 'ITEM.FOCUS', index: number }
    | { type: 'ITEM.HOVER', value: number }
    | { type: 'HOVER.CLEAR' }
    | { type: 'CONTROL.BLUR' }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'canInteract'
  action:
    | 'setValue'
    | 'stepValue'
    | 'toMin'
    | 'toMax'
    | 'setHovered'
    | 'clearHovered'
    | 'setFocused'
    | 'clearFocused'
    | 'resetToDefault'
  effect: never
}

export interface RatingApi<T extends PropTypes = PropTypes> {
  /** 已归一化的评分：非法与越界的宿主输入在这里被夹回。 */
  value: number
  /** 指针预览值；没有预览（或不可交互）时为 null。 */
  hoveredValue: number | null
  /** 当前应点亮到的位置：有预览时是预览值，否则是评分。样式与 data-highlighted 使用的都是它。 */
  highlightedValue: number
  /** 分值文本：当前应点亮到的数值，指针预览期间跟随预览值。 */
  valueText: string
  count: number
  /** 尚未评分（value 为 0）。 */
  empty: boolean
  disabled: boolean
  readOnly: boolean
  /** 1..count 的序号表，作者直接遍历它渲染星星。 */
  items: readonly number[]
  getItemState: (props: RatingItemProps) => RatingItemState
  setValue: (next: number) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getControlProps: () => T['element']
  /** 分值文本：写在 root 中、control 的兄弟；aria-hidden，读屏使用星星自身的可及名。 */
  getValueTextProps: () => T['element']
  getItemProps: (props: RatingItemProps) => T['element']
  /** 表单出口：一份视觉隐藏的原生输入，随表单提交当前评分。 */
  getHiddenInputProps: () => T['input']
}

/** 读屏文案，默认英文。 */
export interface RatingTranslations {
  /**
   * 一颗星的可及名，入参为它的分值与总档数。
   *
   * 该文案总会发出：星星格内绘制的是符号，点亮与未点亮绘制的还不是同一个，
   * 名字交给内容时会随高亮在两个符号之间来回变化。
   */
  item: (value: number, count: number) => string
}
