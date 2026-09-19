/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 checkbox group 类型契约。

import type { MachineSchema, Orientation, PropTypes, Size, Tone } from '@xihan-ui/core'

export interface CheckboxGroupValueChangeDetails {
  value: string[]
}

/**
 * 全选态，用于驱动 indeterminate 的父复选框。
 * - checked       组内声明的条目全部选中
 * - indeterminate 选中了一部分（对应 aria-checked="mixed"）
 * - unchecked     没有选中任何条目
 */
export type CheckboxGroupCheckedState = 'checked' | 'unchecked' | 'indeterminate'

/** 条目数据。提供 collection 时，显示文本与禁用以它为准。 */
export interface CheckboxGroupNode {
  value: string
  /** 展示文本；默认回退为 value。 */
  label?: string
  /** 条目禁用：仍可聚焦、仍占一个 Tab 停靠点，但不可修改，全选也跳过它。 */
  disabled?: boolean
}

/** 单个条目的元信息，由 collection 推导，不含选中态。 */
export interface CheckboxGroupNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
}

/**
 * 条目声明的身份：值必须声明，禁用可由 collection 代为声明。
 * connect 不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface CheckboxGroupItemProps {
  value: string
  /** 逐条覆盖禁用；未提供时从 collection 查询，两处都未声明即为不禁用。 */
  disabled?: boolean
}

/** 接了按压通道的两个部件：条目按 value 记，全选格整组只有一个、不带 value。 */
export type CheckboxGroupPressedPart = 'item' | 'select-all-trigger'

export interface CheckboxGroupSchema extends MachineSchema {
  props: {
    /**
     * 条目数据，显示文本与禁用的事实源。提供后条目部件只需声明 value。
     * 未提供时回到文本与禁用都写在条目部件上的方式。
     */
    collection?: CheckboxGroupNode[]
    /** 选中值集合。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。 */
    value?: string[]
    defaultValue?: string[]
    /** 组内全部条目的值，按书写顺序声明；未提供时 checkedState 退化为 unchecked / indeterminate 两态。 */
    itemValues?: string[]
    /** 整组禁用：每一项随之禁用，且隐藏输入不参与提交。 */
    disabled?: boolean
    /** 只读：仍可聚焦与朗读，但用户不可修改。 */
    readOnly?: boolean
    /** 校验失败标注，写入每个条目的 aria-invalid。 */
    invalid?: boolean
    /** 表单字段名；提供后每个条目的隐藏输入才带 name，同名多值一并提交。 */
    name?: string
    /** 视觉排布，默认 vertical。只输出 data-orientation，不输出 aria-orientation。 */
    orientation?: Orientation
    /** 语气：brand / neutral / success / warning / danger / info，决定勾选方框使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定方框与文字的几何档位。 */
    size?: Size
    /** value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onValueChange?: (details: CheckboxGroupValueChangeDetails) => void
  }
  context: {
    /** 选中值。受控（value 提供）时 cell 直读 prop，写入只发 onValueChange 不修改内部值。 */
    value: string[]
    /** 按压通道：Space 或触屏按住的是条目还是全选格。 */
    pressedPart: CheckboxGroupPressedPart | null
    /** 按压通道：按住的条目 value；按住的是全选格时为 null。抬起、失焦或指针取消即清空，与选中互相独立。 */
    pressedValue: string | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'idle'
  event:
    | { type: 'VALUE.SET', value: string[] }
    | { type: 'ITEM.TOGGLE', value: string }
    /** values 是事件发生时查询到的可用条目值。 */
    | { type: 'ALL.TOGGLE', values: string[] }
    | { type: 'FORM.RESET' }
    /**
     * 条目或全选格被 Space 或触屏按住；条目带 value，全选格不带。
     * disabled 是条目自身的禁用事实，由 connect 判定后随事件带入；整组禁用与只读由守卫按 props 判。
     */
    | { type: 'PRESS.START', part: CheckboxGroupPressedPart, value?: string, disabled?: boolean }
    /** 按住的部件抬起、失焦或指针取消；只松开 part + value 对应的那一个。 */
    | { type: 'PRESS.END', part: CheckboxGroupPressedPart, value?: string }
  tag: never
  guard: 'editable' | 'canPress'
  action:
    | 'setValue'
    | 'toggleItem'
    | 'toggleAll'
    | 'resetToDefault'
    | 'startPress'
    | 'endPress'
    | 'releaseWhenInert'
  effect: never
}

export interface CheckboxGroupApi<T extends PropTypes = PropTypes> {
  value: string[]
  /** 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 */
  collection: readonly CheckboxGroupNodeMeta[]
  checkedState: CheckboxGroupCheckedState
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  isChecked: (value: string) => boolean
  /** 整体替换选中集合。程序化入口，不受 readOnly 拦截。 */
  setValue: (next: string[]) => void
  /** 切换某个值；整组禁用或只读时无效。 */
  toggleValue: (value: string) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getItemProps: (props: CheckboxGroupItemProps) => T['element']
  getIndicatorProps: (props: CheckboxGroupItemProps) => T['element']
  getItemTextProps: (props: CheckboxGroupItemProps) => T['element']
  /** 条目的表单影子：一份视觉隐藏的原生 checkbox，由条目内部渲染。 */
  getHiddenInputProps: (props: CheckboxGroupItemProps) => T['input']
  /** 全选 / 半选的父复选框。必须写在 root 之内，它依靠祖先链找到本组。 */
  getSelectAllTriggerProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface CheckboxGroupTranslations {}
