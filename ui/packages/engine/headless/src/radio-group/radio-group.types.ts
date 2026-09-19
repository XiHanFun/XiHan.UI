/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 radio group 类型契约。

import type { Direction, MachineSchema, Orientation, PropTypes, Size, Tone } from '@xihan-ui/core'

export interface RadioGroupValueChangeDetails {
  value: string | null
}

/** 条目数据。提供 collection 时，显示文本与禁用以它为准。 */
export interface RadioGroupNode {
  value: string
  /** 展示文本；默认回退为 value。 */
  label?: string
  /** 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
}

/** 单个条目的元信息，由 collection 推导，不含选中态与焦点态。 */
export interface RadioGroupNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
}

/**
 * 条目声明：值必须声明，禁用可由 collection 代为声明。
 * connect 据此产出属性，不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface RadioGroupItemProps {
  value: string
  /** 逐条覆盖禁用；未提供时从 collection 查询，两处都未声明即为不禁用。 */
  disabled?: boolean
}

export interface RadioGroupSchema extends MachineSchema {
  props: {
    /**
     * 条目数据，显示文本与禁用的事实源。提供后条目部件只需声明 value。
     * 未提供时回到文本与禁用都写在条目部件上的方式。
     */
    collection?: RadioGroupNode[]
    value?: string | null
    defaultValue?: string | null
    disabled?: boolean
    /** 只读：不可选择，但仍可聚焦、方向键照常移动焦点，对比度不降低。 */
    readOnly?: boolean
    /** 校验失败：只改变呈现，不阻止交互。 */
    invalid?: boolean
    /** 必填：随表单校验一起使用，只发无障碍属性，不自行拦截提交。 */
    required?: boolean
    orientation?: Orientation
    /** 文字方向，默认 'ltr'。 */
    dir?: Direction
    /** 表单字段名。 */
    name?: string
    /** 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /** value 变化回调。 */
    onValueChange?: (details: RadioGroupValueChangeDetails) => void
  }
  context: {
    /** 选中值。 */
    value: string | null
    /** 焦点锚点，离开组时为 null。 */
    focusedValue: string | null
    /** 按压通道：Space 或触屏按住的条目 value。抬起、失焦或指针取消即清空，与选中互相独立。 */
    pressedValue: string | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'idle'
  event:
    | { type: 'VALUE.SET', value: string }
    | { type: 'ITEM.SELECT', value: string }
    | { type: 'ITEM.FOCUS', value: string }
    | { type: 'GROUP.BLUR' }
    | { type: 'FORM.RESET' }
    /** 条目被 Space 或触屏按住；disabled 是条目自身的禁用事实，由 connect 判定后随事件带入。 */
    | { type: 'PRESS.START', value: string, disabled?: boolean }
    /** 按住的条目抬起、失焦或指针取消；只松开 value 对应的那一个。 */
    | { type: 'PRESS.END', value: string }
  tag: never
  guard: 'canPress'
  action:
    | 'setValue'
    | 'setFocusedValue'
    | 'clearFocusedValue'
    | 'resetToDefault'
    | 'startPress'
    | 'endPress'
    | 'releaseWhenInert'
  effect: never
}

export interface RadioGroupApi<T extends PropTypes = PropTypes> {
  value: string | null
  /** 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 */
  collection: readonly RadioGroupNodeMeta[]
  /** 焦点在组外时为 null。 */
  focusedValue: string | null
  setValue: (next: string) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getItemProps: (props: RadioGroupItemProps) => T['element']
  getItemTextProps: (props: RadioGroupItemProps) => T['element']
  getIndicatorProps: (props: RadioGroupItemProps) => T['element']
  /** 条目对应的隐藏原生 radio 输入，用于表单提交。 */
  getHiddenInputProps: (props: RadioGroupItemProps) => T['input']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface RadioGroupTranslations {}
