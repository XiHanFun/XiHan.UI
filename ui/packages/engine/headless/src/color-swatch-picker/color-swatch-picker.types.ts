/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 color swatch picker 类型契约。

import type { Direction, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

export interface ColorSwatchPickerValueChangeDetails {
  /** 选中的那格自报的颜色串；没选时 null。 */
  value: string | null
}

/** 一格色块的数据。给了 swatches，可及名字与禁用就以它为准。 */
export interface ColorSwatchPickerNode {
  /** 颜色串，也是这一格的身份。 */
  value: string
  /** 读屏怎么念这一格，例如「品牌红」；缺省念颜色串。 */
  label?: string
  /** 这一格禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
}

/** 单格的元信息，由 swatches 推出，不含选中态与焦点态。 */
export interface ColorSwatchPickerNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
}

/**
 * 格子声明：颜色串必报，名字与禁用可由 swatches 代为声明。
 * connect 据此产出属性，不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface ColorSwatchPickerItemProps {
  value: string
  /** 逐格覆盖名字；缺省时回 swatches 里查，两处都没有即念颜色串。 */
  label?: string
  /** 逐格覆盖禁用；缺省时回 swatches 里查，两处都没有即为不禁用。 */
  disabled?: boolean
}

export interface ColorSwatchPickerSchema extends MachineSchema {
  props: {
    /**
     * 格子数据，可及名字与禁用的事实源。给了它，格子部件只需报 value。
     * 缺省即回到「名字与禁用都写在格子部件上」的老路。
     */
    swatches?: ColorSwatchPickerNode[]
    /** 选中的颜色串。给定即受控：写只发 onValueChange 不落内部值。写法不同的同一个颜色也算选中。 */
    value?: string | null
    defaultValue?: string | null
    disabled?: boolean
    /** 只读：选不动，但仍可聚焦、方向键照常移焦点，对比度不降。 */
    readOnly?: boolean
    /** 校验失败：只改呈现，不挡交互。 */
    invalid?: boolean
    /** 必填：随表单校验一起用，只发无障碍属性，不自行拦提交。 */
    required?: boolean
    /** 文字方向，缺省 'ltr'；只改写左右两键的语义。 */
    dir?: Direction
    /** 表单字段名。 */
    name?: string
    /** 尺寸：sm / md / lg，换的是格子的边长与间距。 */
    size?: Size
    /** 语气：决定选中环与选中标记用哪族颜色。 */
    tone?: Tone
    translations?: Partial<ColorSwatchPickerTranslations>
    /** value 变化回调。 */
    onValueChange?: (details: ColorSwatchPickerValueChangeDetails) => void
  }
  context: {
    /** 选中值：格子自报的那个串。 */
    value: string | null
    /** 焦点锚点，离组时为 null。 */
    focusedValue: string | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'idle'
  event:
    | { type: 'VALUE.SET', value: string | null }
    | { type: 'ITEM.SELECT', value: string }
    | { type: 'ITEM.FOCUS', value: string }
    | { type: 'GROUP.BLUR' }
    | { type: 'FORM.RESET' }
  tag: never
  guard: never
  action: 'setValue' | 'setFocusedValue' | 'clearFocusedValue' | 'resetToDefault'
  effect: never
}

export interface ColorSwatchPickerApi<T extends PropTypes = PropTypes> {
  value: string | null
  /** swatches 推出的格子元信息，按数据顺序排列；没给 swatches 即空数组。 */
  swatches: readonly ColorSwatchPickerNodeMeta[]
  /** 焦点在组外时为 null。 */
  focusedValue: string | null
  /** 某个颜色串是不是当前选中的那一格：写法不同（`#f00` 与 `rgb(255,0,0)`）也算同一个。 */
  isSelected: (value: string) => boolean
  setValue: (next: string | null) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  /** 一格：role=radio，颜色串是它的身份。 */
  getItemProps: (props: ColorSwatchPickerItemProps) => T['element']
  /** 格里的色块面：走 Swatch 家族画颜色，纯装饰。 */
  getSwatchProps: (props: ColorSwatchPickerItemProps) => T['element']
  /** 选中标记（对号），纯装饰。 */
  getIndicatorProps: (props: ColorSwatchPickerItemProps) => T['element']
  /** 格子对应的隐藏原生 radio 输入，用于表单提交。 */
  getHiddenInputProps: (props: ColorSwatchPickerItemProps) => T['input']
}

/** 读屏用的文案，默认英文。 */
export interface ColorSwatchPickerTranslations {
  /** 整组的名字；作者没放 label 部件时用它。 */
  group: string
  /** 一格的名字，按颜色串给；swatches 或格子部件给了 label 时不用它。 */
  swatch: (value: string) => string
}
