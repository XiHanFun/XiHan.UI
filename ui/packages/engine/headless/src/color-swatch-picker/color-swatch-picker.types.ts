/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 color swatch picker 类型契约。

import type { Direction, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

export interface ColorSwatchPickerValueChangeDetails {
  /** 选中格声明的颜色串；未选中时为 null。 */
  value: string | null
}

/** 一格色块的数据。提供 swatches 时，可及名与禁用以它为准。 */
export interface ColorSwatchPickerNode {
  /** 颜色串，也是该格的身份。 */
  value: string
  /** 读屏朗读该格的方式，例如「品牌红」；默认朗读颜色串。 */
  label?: string
  /** 该格禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
}

/** 单格的元信息，由 swatches 推导，不含选中态与焦点态。 */
export interface ColorSwatchPickerNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
}

/**
 * 格子声明：颜色串必须声明，名字与禁用可由 swatches 代为声明。
 * connect 据此产出属性，不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface ColorSwatchPickerItemProps {
  value: string
  /** 逐格覆盖名字；未提供时从 swatches 查询，两处都未声明即朗读颜色串。 */
  label?: string
  /** 逐格覆盖禁用；未提供时从 swatches 查询，两处都未声明即为不禁用。 */
  disabled?: boolean
}

export interface ColorSwatchPickerSchema extends MachineSchema {
  props: {
    /**
     * 格子数据，可及名与禁用的事实源。提供后格子部件只需声明 value。
     * 未提供时回到名字与禁用都写在格子部件上的方式。
     */
    swatches?: ColorSwatchPickerNode[]
    /** 选中的颜色串。提供即受控：写入只发 onValueChange 不落内部值。写法不同的同一颜色也视为选中。 */
    value?: string | null
    defaultValue?: string | null
    disabled?: boolean
    /** 只读：不可选择，但仍可聚焦、方向键照常移动焦点，对比度不降低。 */
    readOnly?: boolean
    /** 校验失败：只改变呈现，不阻止交互。 */
    invalid?: boolean
    /** 必填：随表单校验一起使用，只发无障碍属性，不自行拦截提交。 */
    required?: boolean
    /** 文字方向，默认 'ltr'；只改写左右两键的语义。 */
    dir?: Direction
    /** 表单字段名。 */
    name?: string
    /** 尺寸：sm / md / lg，影响格子的边长与间距。 */
    size?: Size
    /** 语气：决定选中环与选中标记使用哪族颜色。 */
    tone?: Tone
    translations?: Partial<ColorSwatchPickerTranslations>
    /** value 变化回调。 */
    onValueChange?: (details: ColorSwatchPickerValueChangeDetails) => void
  }
  context: {
    /** 选中值：格子声明的颜色串。 */
    value: string | null
    /** 焦点锚点，离开组时为 null。 */
    focusedValue: string | null
    /**
     * 按压通道：Space 或触屏手指按下到松开之间正被按住的格子（按颜色串记），该格投影 data-pressed；没有按住时为 null。
     * 整组禁用或只读时谁都不进，格子自身的禁用由 connect 判定后随事件带入。
     */
    pressedValue: string | null
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
    // 按压通道（shared/press）：Space 或触屏按住与松开，value 说的是哪一格；
    // disabled 是该格自身的禁用事实，由 connect 判定后随事件带入
    | { type: 'PRESS.START', value: string, disabled?: boolean }
    | { type: 'PRESS.END', value: string }
  tag: never
  guard: 'canPress'
  action: 'setValue' | 'setFocusedValue' | 'clearFocusedValue' | 'resetToDefault' | 'startPress' | 'endPress' | 'releaseWhenInert'
  effect: never
}

export interface ColorSwatchPickerApi<T extends PropTypes = PropTypes> {
  value: string | null
  /** 由 swatches 推导的格子元信息，按数据顺序排列；未提供 swatches 时为空数组。 */
  swatches: readonly ColorSwatchPickerNodeMeta[]
  /** 焦点在组外时为 null。 */
  focusedValue: string | null
  /** 某个颜色串是否为当前选中的格：写法不同（`#f00` 与 `rgb(255,0,0)`）也视为同一颜色。 */
  isSelected: (value: string) => boolean
  setValue: (next: string | null) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  /** 一格：role=radio，颜色串是它的身份。 */
  getItemProps: (props: ColorSwatchPickerItemProps) => T['element']
  /** 格内的色块面：使用 Swatch 家族绘制颜色，纯装饰。 */
  getSwatchProps: (props: ColorSwatchPickerItemProps) => T['element']
  /** 选中标记（对号），纯装饰。 */
  getIndicatorProps: (props: ColorSwatchPickerItemProps) => T['element']
  /** 格子对应的隐藏原生 radio 输入，用于表单提交。 */
  getHiddenInputProps: (props: ColorSwatchPickerItemProps) => T['input']
}

/** 读屏文案，默认英文。 */
export interface ColorSwatchPickerTranslations {
  /** 整组的名字；作者未放置 label 部件时使用它。 */
  group: string
  /** 一格的名字，按颜色串提供；swatches 或格子部件提供了 label 时不使用它。 */
  swatch: (value: string) => string
}
