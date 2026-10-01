/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 radio group 类型契约。

import type { Direction, MachineSchema, Orientation, PropTypes, Size, Tone } from '@xihan-ui/core'
import type { LiquidIndicator } from '../shared/indicator'

/**
 * 结构形态：list 是一列「圆圈 + 文案」的行（缺省）；card 是一组可点的描边卡，
 * 圆圈在卡的行首，文案与说明排在右侧，选中卡换选中面；segmented 是一条淡底轨道里首尾相接的一排段，
 * 选中段由一块白色抬起的滑块（thumb 部件）标出，换段时滑块滑过去。
 * 与 Tabs 的 line / card / segment 同类，不是有框 / 无框的 ControlVariant。
 */
export type RadioGroupVariant = 'card' | 'list' | 'segmented'

export interface RadioGroupValueChangeDetails {
  value: string | null
}

/** 条目数据。提供 collection 时，显示文本与禁用以它为准。 */
export interface RadioGroupNode {
  value: string
  /** 展示文本；默认回退为 value。 */
  label?: string
  /** 说明文字，写入 item-description 部件；未提供时本条不铺该部件。 */
  description?: string
  /** 图标文本，写入文字前的 item-icon 部件，对读屏隐藏；需要放置图形时改为手写部件。未提供时本条不铺该部件。 */
  icon?: string
  /** 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
}

/** 单个条目的元信息，由 collection 推导，不含选中态与焦点态。 */
export interface RadioGroupNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  /** 未提供时为 null。 */
  description: string | null
  /** 未提供时为 null。 */
  icon: string | null
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

/** 滑块相对 root 内衬盒的位置与尺寸（px），起始缘按逻辑方向计算。 */
export interface RadioGroupThumbRect {
  blockStart: number
  blockSize: number
  inlineStart: number
  inlineSize: number
}

/** 适配器在挂载前填入的 DOM 取值器。 */
export interface RadioGroupRefs {
  /** 条目集合的查询容器，同时是滑块定位的参照系。 */
  getRootEl: () => HTMLElement | null
  /** 液态档的双沿滑块：由效应建好放进来，量到的落点交给它。 */
  liquidThumb: LiquidIndicator | null
  /** 按当下的形态挂上或摘下滑块的尺寸观察：只有 segmented 形态才盯，由效应建好放进来。 */
  syncThumbLayout: (() => void) | null
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
    /** 视觉排布：list / card 缺省竖排，segmented 缺省横排。方向键接受的轴与它无关（四个方向键恒响应）。 */
    orientation?: Orientation
    /**
     * 文字方向，只改写左右方向键的语义与滑块的起始缘，上下键与之无关。
     * 未提供时从根节点的计算样式读取（祖先链上的 dir 与 CSS direction 都计入），提供后以它为准。
     */
    dir?: Direction
    /** 表单字段名。 */
    name?: string
    /** 方向键到达末尾是否回绕，默认 true。 */
    loop?: boolean
    /** 撑满行宽，各段等分剩余空间；只在 segmented 形态下生效。 */
    block?: boolean
    /** 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /** 结构形态，默认 list；card 把每个条目画成一张可点的卡，segmented 画成轨道里的一排段。 */
    variant?: RadioGroupVariant
    /**
     * 作者渲染了 label 部件时置真，由适配器统计而不是判断标题文字是否有值。
     * 为假时根不输出 aria-labelledby：指向未渲染的 id 会让组没有名字，作者写在根上的 aria-label 也会被它压住。
     */
    labelled?: boolean
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
    /**
     * 滑块要画的盒子：量到的落点；液态档下两沿走弹簧时是这一帧的位置。
     * 不是 segmented 形态、没有选中项或无法测量时为 null。
     */
    thumb: RadioGroupThumbRect | null
    /** 液态档下滑块沿主轴比目标长出的比例，皮肤据它在另一个方向上压扁；标准档与停稳时为 0。 */
    thumbStretch: number
    /**
     * 滑块这一落点直接到位、不走皮肤的过渡：首次落位、同一项重量挪动了落点（尺寸变化、换上正式字体）、
     * 液态档逐帧推着走时为 true；标准档换项时为 false，交给皮肤滑过去。投影为滑块的 data-instant。
     */
    thumbInstant: boolean
  }
  computed: Record<string, never>
  refs: RadioGroupRefs
  state: 'idle'
  event:
    | { type: 'VALUE.SET', value: string }
    | { type: 'ITEM.SELECT', value: string }
    | { type: 'ITEM.FOCUS', value: string }
    | { type: 'GROUP.BLUR' }
    | { type: 'FORM.RESET' }
    /** 重新测量滑块：尺寸观察器与使用者的 measure() 都发出它。 */
    | { type: 'THUMB.MEASURE' }
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
    | 'measureThumb'
    | 'syncThumbLayout'
    | 'startPress'
    | 'endPress'
    | 'releaseWhenInert'
  effect: 'trackThumbLayout' | 'trackLiquidThumb'
}

export interface RadioGroupApi<T extends PropTypes = PropTypes> {
  value: string | null
  /** 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 */
  collection: readonly RadioGroupNodeMeta[]
  /** 焦点在组外时为 null。 */
  focusedValue: string | null
  /** 结算后的结构形态：没传 variant 即 list。适配器据它决定按 collection 铺开时放不放滑块。 */
  variant: RadioGroupVariant
  setValue: (next: string) => void
  /**
   * 重新测量滑块（只在 segmented 形态下有落点）。选中值变化与 collection 增删改名都会自动重新测量，
   * 根与条目的尺寸变化由尺寸观察器接管；条目的文字由部件手写（未经 collection）而后修改时需要手动调用。
   */
  measure: () => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getItemProps: (props: RadioGroupItemProps) => T['element']
  /** 条目文字前的图标位：纯装饰，对读屏隐藏，状态标记与条目一致。 */
  getItemIconProps: (props: RadioGroupItemProps) => T['element']
  getItemTextProps: (props: RadioGroupItemProps) => T['element']
  /** 条目的说明：文案下方一行次级文字，常用在 card 形态里。 */
  getItemDescriptionProps: (props: RadioGroupItemProps) => T['element']
  /** 条目行首的单选圆圈；segmented 形态由滑块标出选中，皮肤不画它。 */
  getIndicatorProps: (props: RadioGroupItemProps) => T['element']
  /** segmented 形态里滑动的选中标记：整组一份，位置与尺寸由状态机量好写成私有槽；没有落点时收起。 */
  getThumbProps: () => T['element']
  /** 条目对应的隐藏原生 radio 输入，用于表单提交。 */
  getHiddenInputProps: (props: RadioGroupItemProps) => T['input']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface RadioGroupTranslations {}
