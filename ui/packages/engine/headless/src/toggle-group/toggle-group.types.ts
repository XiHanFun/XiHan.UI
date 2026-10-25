/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 toggle group 类型契约。

import type { ActionVariant, Direction, MachineSchema, Orientation, PropTypes, Size, Tone } from '@xihan-ui/core'
import type { SelectionValueKey } from '../shared/value-codec'

/**
 * 作者侧的值形态：单个值、值集合，或 null（无选中）。V 是值的类型，缺省 string。
 * 内部一律归一为键的数组，对外回调再转回作者侧的形态与原值。
 */
export type ToggleGroupValue<V = string> = V | readonly V[] | null

/**
 * 按 multiple 收窄的选中值：多选是数组（可能为空），单选是一个值、无选中为 null。M 是 multiple 的字面量类型，
 * 根组件据它定 value / onValueChange 的形状；M 推断不出（multiple 绑的是 boolean 变量）时两种都收。
 */
export type ToggleGroupSelection<V, M extends boolean> = M extends true ? V[] : V | null

/** 交进来的选中值按 multiple 收窄：多选收只读数组也行。 */
export type ToggleGroupModel<V, M extends boolean> = M extends true ? readonly V[] : V | null

/** V 是选中值的类型，缺省 string；数字、对象都行，见 ToggleGroupSchema 的 valueKey。 */
export interface ToggleGroupValueChangeDetails<V = string> {
  /** multiple=true 时是数组（可能为空）；单选时是选中值，无选中为 null。 */
  value: V | V[] | null
}

/** 条目数据。提供 collection 时，显示文本与禁用以它为准。 */
export interface ToggleGroupNode<V = string> {
  value: V
  /** 展示文本；默认回退为值（不是字符串的值退回它的键）。 */
  label?: string
  /** 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
}

/** 单个条目的元信息，由 collection 推导，不含选中态与焦点态。 */
export interface ToggleGroupNodeMeta<V = string> {
  value: V
  /** 值的键：字符串值即它本身，别的值是编出来的键。条目的 data-value 与列表里的 key 用它。 */
  key: string
  /** node.label，没写时退回值（不是字符串的值退回它的键），恒为字符串。 */
  label: string
  disabled: boolean
}

/**
 * 条目声明的身份：值必须声明，禁用可由 collection 代为声明。
 * connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得反查 DOM。
 */
export interface ToggleGroupItemProps<V = string> {
  value: V
  /** 逐条覆盖禁用；未提供时从 collection 查询，两处都未声明即为不禁用。 */
  disabled?: boolean
}

/**
 * V 是选中值的类型，缺省 string。机器与 DOM 只认字符串键：值进来时编成键（字符串原样，数字转字符串，
 * 对象按 valueKey），onValueChange 与 api 交出去时解回原值。
 */
export interface ToggleGroupSchema<V = string> extends MachineSchema {
  props: {
    /**
     * 条目数据，显示文本与禁用的事实源。提供后条目部件只需声明 value。
     * 未提供时回到文本与禁用都写在条目部件上的方式。
     */
    collection?: ToggleGroupNode<V>[]
    /**
     * 对象值怎样取键：字段名或取值函数。同一个选项每次都是新对象（接口刚取回来）时给它；
     * 不给时按对象身份认。值不是对象时用不着。键也是条目的 data-value 与随表单提交的值。
     */
    valueKey?: SelectionValueKey<V>
    /** 选中值。提供即受控：内部不再自行修改，只发 onValueChange。 */
    value?: ToggleGroupValue<V>
    defaultValue?: ToggleGroupValue<V>
    /** 允许多项同时选中；false 时选中一项即替换其余。 */
    multiple?: boolean
    /**
     * 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上。
     * 放进字段（字段接线）或渲染了 label 部件时名字以它们为准，aria-labelledby 盖过它。
     */
    ariaLabel?: string
    /** 整组禁用：条目全部 aria-disabled，点击与方向键都不生效。 */
    disabled?: boolean
    /** 只读：条目仍可聚焦、方向键照常走，点击与 Space / Enter 不改选中，也不进按压面。 */
    readOnly?: boolean
    /** 校验失败标注：单选组写 aria-invalid；多选是 role=group，只写 data-invalid。 */
    invalid?: boolean
    /** 必填：单选组写 aria-required，表单影子写原生 required；多选只写 data-required 与原生 required。 */
    required?: boolean
    /**
     * 不允许清空值：单选模式下点击当前选中项不再取消它，多选模式下不可移除最后一个。
     * 默认 false（可以点击为无选中）。
     */
    disallowEmpty?: boolean
    /** 变体：solid / subtle / outline / ghost，决定段的底色与描边使用方式。 */
    variant?: ActionVariant
    /** 颜色：brand / neutral / success / warning / danger / info。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /** 撑满行宽：整组占满可用宽度，每段等分剩余空间。 */
    fullWidth?: boolean
    /** 是否自动在相邻条目之间插入分隔线，默认 true。 */
    separators?: boolean
    /** 表单字段名。提供后隐藏输入才带 name 并参与提交。 */
    name?: string
    /** 视觉排布，默认 horizontal。方向键接受的轴与它无关（四个方向键恒响应）。 */
    orientation?: Orientation
    /** 文字方向，默认 ltr；只改写左右方向键的语义，上下键与之无关。 */
    dir?: Direction
    /** 方向键到达末尾是否回绕，默认 true。 */
    loop?: boolean
    /**
     * roving tabindex，默认开启：整组只占一个 Tab 位，组内依靠方向键移动。
     * 关闭后每个条目自成一个 Tab 停靠点，方向键不再接管。
     */
    rovingFocus?: boolean
    /** value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onValueChange?: (details: ToggleGroupValueChangeDetails<V>) => void
  }
  context: {
    /**
     * 选中集合。内部恒为数组（单选时长度 ≤ 1），不随 multiple 改变类型。
     * 受控（value 提供）时 cell 直读 prop，写入只发 onValueChange 不修改内部值。
     */
    value: string[]
    /** 焦点位于组内时的瞬态锚点，焦点离开组即清空。 */
    focusedValue: string | null
    /** 按压通道：Space / Enter 或触屏按住的条目 value。抬起、失焦或指针取消即清空，与开关态互相独立。 */
    pressedValue: string | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 选中值不编码进状态，状态机因此只有一个状态，逻辑全在 context 与 actions。 */
  state: 'idle'
  event:
    | { type: 'VALUE.SET', value: ToggleGroupValue }
    | { type: 'ITEM.TOGGLE', value: string }
    | { type: 'ITEM.FOCUS', value: string }
    | { type: 'GROUP.BLUR' }
    /** 所在表单被重置，选中集合回到 defaultValue。 */
    | { type: 'FORM.RESET' }
    /** 条目被 Space / Enter 或触屏按住；disabled 是条目自身的禁用事实，由 connect 判定后随事件带入。 */
    | { type: 'PRESS.START', value: string, disabled?: boolean }
    /** 按住的条目抬起、失焦或指针取消；只松开 value 对应的那一个。 */
    | { type: 'PRESS.END', value: string }
  tag: never
  guard: 'canPress' | 'canToggle'
  action:
    | 'setValue'
    | 'toggleItem'
    | 'setFocusedValue'
    | 'clearFocusedValue'
    | 'resetToDefault'
    | 'startPress'
    | 'endPress'
    | 'releaseWhenInert'
  effect: never
}

/** V 是选中值的类型：value、collection 与焦点交出原值，收值的 getter 与动作也收原值。 */
export interface ToggleGroupApi<T extends PropTypes = PropTypes, V = string> {
  /** 当前选中集合，恒为数组（单选时长度 ≤ 1）。 */
  value: V[]
  /** 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 */
  collection: readonly ToggleGroupNodeMeta<V>[]
  /** 焦点在组外时为 null。 */
  focusedValue: V | null
  multiple: boolean
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  required: boolean
  orientation: Orientation
  separators: boolean
  isSelected: (value: V) => boolean
  /** 传单值 / 数组 / null 均可，内部按 multiple 归一。 */
  setValue: (next: ToggleGroupValue<V>) => void
  getRootProps: () => T['element']
  getItemProps: (props: ToggleGroupItemProps<V>) => T['button']
  /** 表单出口：整组只有一份，提交的即当前选中值。 */
  getHiddenInputProps: () => T['input']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface ToggleGroupTranslations {}
