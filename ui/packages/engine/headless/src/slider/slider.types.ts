/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 slider 类型契约。

import type { Direction, MachineSchema, Orientation, PropTypes, Size, Tone } from '@xihan-ui/core'

export interface SliderValueChangeDetails {
  value: number[]
}

export interface SliderValueChangeEndDetails {
  value: number[]
  /** 刚被推动的滑块的下标。 */
  index: number
}

export interface SliderPoint {
  clientX: number
  clientY: number
}

export interface SliderValueTextDetails {
  value: number
  /** 第几个滑块；多滑块时用于区分起点与终点。 */
  index: number
}

export interface SliderSchema extends MachineSchema {
  props: {
    value?: number[]
    defaultValue?: number[]
    min?: number
    max?: number
    step?: number
    /** PageUp / PageDown 的步长，默认 10 倍 step。 */
    largeStep?: number
    orientation?: Orientation
    dir?: Direction
    disabled?: boolean
    readOnly?: boolean
    invalid?: boolean
    /** 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定拇指直径与轨道厚度 */
    size?: Size
    /** 表单字段名；多滑块时逐个 append。 */
    name?: string
    /** 相邻滑块至少相隔的格数，默认 0（可以贴在一起但不能交换顺序）。 */
    minStepsBetweenThumbs?: number
    /** 刻度表：轨道上的圆点与文案，点击文案即跳到该值。 */
    marks?: SliderMark[]
    /** 只接受刻度落点：拖动、点击与键盘都吸附到最近 / 下一档刻度。 */
    snapToMarks?: boolean
    /**
     * 把值转换为可读文字，产出写入拇指的 aria-valuetext。
     * 未提供时不写该属性，读屏回退为朗读 aria-valuenow。
     */
    getValueText?: (details: SliderValueTextDetails) => string
    /** 每次推动都发出；拖动过程中连续发出。 */
    onValueChange?: (details: SliderValueChangeDetails) => void
    /** 只在一次操作结束时发出一次，适合用于发起请求。 */
    onValueChangeEnd?: (details: SliderValueChangeEndDetails) => void
  }
  context: {
    value: number[]
    /** 正在被推动的滑块下标：拖动期间是被抓住的滑块，键盘操作时是聚焦的滑块。 */
    activeIndex: number
  }
  computed: Record<string, never>
  refs: {
    getTrackEl: () => HTMLElement | null
  }
  state: 'idle' | 'dragging'
  event:
    /** 整组赋值（作者的命令式出口）；写入前逐个吸附到 step 网格并按邻居顺序归位。 */
    | { type: 'VALUE.SET', value: number[] }
    | { type: 'THUMB.STEP', index: number, direction: 1 | -1, large?: boolean }
    | { type: 'THUMB.TO_MIN', index: number }
    | { type: 'THUMB.TO_MAX', index: number }
    | { type: 'THUMB.SET', index: number, value: number }
    | { type: 'THUMB.FOCUS', index: number }
    | { type: 'DRAG.START', point: SliderPoint }
    | { type: 'DRAG.MOVE', point: SliderPoint }
    | { type: 'DRAG.END' }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'canDrag'
  action:
    | 'setValue'
    | 'stepThumb'
    | 'thumbToMin'
    | 'thumbToMax'
    | 'setThumb'
    | 'setActiveIndex'
    | 'grabNearestThumb'
    | 'dragThumb'
    | 'invokeChangeEnd'
    | 'resetToDefault'
  effect: 'trackPointer'
}

/** 一档刻度：落点值与可选文案。 */
export interface SliderMark {
  value: number
  label?: string
}

/** 刻度部件的声明：代表哪个落点。 */
export interface SliderTickProps {
  value: number
}

/** 刻度的呈现数据。 */
export interface SliderMarkMeta {
  value: number
  label: string | undefined
  /** 在轨道上的位置，0-1。 */
  percent: number
  /** 落在已选区间内（单滑块 = 小于等于当前值），皮肤据此分段上色。 */
  active: boolean
}

export interface SliderThumbState {
  index: number
  value: number
  /** 该滑块在轨道上的位置，0-1。作者用它定位。 */
  percent: number
  /** 它自身可到达的范围（被邻居阻挡的部分不计）。 */
  min: number
  max: number
}

export interface SliderApi<T extends PropTypes = PropTypes> {
  value: number[]
  /** 已选区间在轨道上的起止，0-1。 */
  range: { start: number, end: number }
  thumbs: SliderThumbState[]
  /** 刻度呈现数据：夹进区间、升序去重，带位置与分段上色标记。 */
  marks: SliderMarkMeta[]
  dragging: boolean
  disabled: boolean
  readOnly: boolean
  /** 某个拇指的值文本：提供 getValueText 时是其产出，否则是值本身。 */
  valueText: (index: number) => string
  setValue: (next: number[]) => void
  setThumbValue: (index: number, next: number) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getControlProps: () => T['element']
  getTrackProps: () => T['element']
  getRangeProps: () => T['element']
  getThumbProps: (index: number) => T['element']
  /** 值气泡：挂在拇指中显示该拇指的当前值；aria-hidden，读屏使用拇指自身的 aria-valuetext。 */
  getValueTextProps: (index: number) => T['element']
  /** 刻度容器。 */
  getTickGroupProps: () => T['element']
  /** 刻度点：轨道上的圆点，纯装饰。 */
  getTickProps: (props: SliderTickProps) => T['element']
  /** 刻度文案：点击把最近的滑块跳到该档。 */
  getTickLabelProps: (props: SliderTickProps) => T['element']
  getHiddenInputProps: (index: number) => T['input']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface SliderTranslations {}
