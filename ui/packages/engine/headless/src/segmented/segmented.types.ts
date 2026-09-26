/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 segmented 类型契约。

import type { Direction, MachineSchema, Orientation, PropTypes, Size, Tone } from '@xihan-ui/core'
import type { LiquidIndicator } from '../shared/indicator'

export interface SegmentedValueChangeDetails {
  /** 当前选中值；没有选中任何项时为 null。 */
  value: string | null
}

/** 条目数据。提供 collection 时，显示文本与禁用以它为准。 */
export interface SegmentedNode {
  value: string
  /** 展示文本；默认回退为 value。 */
  label?: string
  /** 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
}

/** 单个条目的元信息，由 collection 推导，不含选中态与焦点态。 */
export interface SegmentedNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
}

/**
 * 条目声明的身份：值必须声明，禁用可由 collection 代为声明。
 * connect 据此产出属性，不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface SegmentedItemProps {
  value: string
  /** 逐条覆盖禁用；未提供时从 collection 查询，两处都未声明即为不禁用。 */
  disabled?: boolean
}

/** 指示器相对 root 内边距盒的位置与尺寸（px），起始缘按逻辑方向计算。 */
export interface SegmentedIndicatorRect {
  blockStart: number
  blockSize: number
  inlineStart: number
  inlineSize: number
}

/** 适配器在挂载前填入的 DOM 取值器。 */
export interface SegmentedRefs {
  /** 条目集合的查询容器，同时是指示器定位的参照系。 */
  getRootEl: () => HTMLElement | null
  /** 液态档的双沿指示器：由效应建好放进来，量到的落点交给它。 */
  liquidIndicator?: LiquidIndicator | null
}

export interface SegmentedSchema extends MachineSchema {
  props: {
    /**
     * 条目数据，显示文本与禁用的事实源。提供后条目部件只需声明 value。
     * 未提供时回到文本与禁用都写在条目部件上的方式。
     */
    collection?: SegmentedNode[]
    /** 选中值。提供即受控：内部不再自行修改，只发 onValueChange。 */
    value?: string | null
    defaultValue?: string | null
    /** 整组禁用：条目全部 aria-disabled，点击与方向键都不生效。 */
    disabled?: boolean
    /** 只读：不可选择，但仍可聚焦、方向键照常移动焦点，对比度不降低。 */
    readOnly?: boolean
    /** 校验失败：只改变呈现，不阻止交互。 */
    invalid?: boolean
    /** 必填：随表单校验一起使用，只发无障碍属性，不自行拦截提交。 */
    required?: boolean
    /** 表单字段名。提供后隐藏输入才带 name 并参与提交。 */
    name?: string
    /** 视觉排布，默认 horizontal。方向键接受的轴与它无关（四个方向键恒响应）。 */
    orientation?: Orientation
    /**
     * 文字方向，只改写左右方向键的语义与指示器的起始缘，上下键与之无关。
     * 未提供时从根节点的计算样式读取（祖先链上的 dir 与 CSS direction 都计入），提供后以它为准。
     */
    dir?: Direction
    /** 方向键到达末尾是否回绕，默认 true。 */
    loop?: boolean
    /** 撑满行宽，各段等分剩余空间。 */
    block?: boolean
    /** 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /** value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onValueChange?: (details: SegmentedValueChangeDetails) => void
  }
  context: {
    /** 选中值。受控（value 提供）时 cell 直读 prop，写入只发 onValueChange 不修改内部值。 */
    value: string | null
    /** 焦点位于组内时的瞬态锚点，焦点离开组即清空。 */
    focusedValue: string | null
    /** 指示器要画的盒子：量到的落点；液态档下两沿走弹簧时是这一帧的位置。没有选中项或无法测量时为 null。 */
    indicator: SegmentedIndicatorRect | null
    /** 液态档下指示器沿主轴比目标长出的比例，皮肤据它在另一个方向上压扁；标准档与停稳时为 0。 */
    indicatorStretch: number
    /** 按压通道：Space / Enter 或触屏按住的段 value。抬起、失焦或指针取消即清空，与选中互相独立。 */
    pressedValue: string | null
  }
  computed: Record<string, never>
  refs: SegmentedRefs
  /** 选中值不编码进状态，状态机因此只有一个状态，逻辑全在 context 与 actions。 */
  state: 'idle'
  event:
    | { type: 'VALUE.SET', value: string | null }
    | { type: 'ITEM.SELECT', value: string }
    | { type: 'ITEM.FOCUS', value: string }
    | { type: 'GROUP.BLUR' }
    /** 重新测量指示器：尺寸观察器与使用者的 measure() 都发出它。 */
    | { type: 'INDICATOR.MEASURE' }
    | { type: 'FORM.RESET' }
    /** 段被 Space / Enter 或触屏按住；disabled 是段自身的禁用事实，由 connect 判定后随事件带入。 */
    | { type: 'PRESS.START', value: string, disabled?: boolean }
    /** 按住的段抬起、失焦或指针取消；只松开 value 对应的那一个。 */
    | { type: 'PRESS.END', value: string }
  tag: never
  guard: 'canPress'
  action:
    | 'setValue'
    | 'setFocusedValue'
    | 'clearFocusedValue'
    | 'resetToDefault'
    | 'measureIndicator'
    | 'startPress'
    | 'endPress'
    | 'releaseWhenInert'
  effect: 'trackIndicatorLayout' | 'trackLiquidIndicator'
}

export interface SegmentedApi<T extends PropTypes = PropTypes> {
  /** 当前选中值；没有选中任何项时为 null。 */
  value: string | null
  /** 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 */
  collection: readonly SegmentedNodeMeta[]
  /** 焦点在组外时为 null。 */
  focusedValue: string | null
  disabled: boolean
  readOnly: boolean
  isSelected: (value: string) => boolean
  setValue: (next: string | null) => void
  /**
   * 重新测量指示器。选中值变化与 collection 增删改名都会自动重新测量，根的尺寸变化由尺寸观察器接管；
   * 以下情况需要手动调用：段的文字由部件手写（未经 collection）而后修改，或字体加载完成把段撑宽。
   */
  measure: () => void
  getRootProps: () => T['element']
  getItemProps: (props: SegmentedItemProps) => T['button']
  getItemTextProps: (props: SegmentedItemProps) => T['element']
  getIndicatorProps: () => T['element']
  /** 选中值随这份原生输入提交。 */
  getHiddenInputProps: () => T['input']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface SegmentedTranslations {}
