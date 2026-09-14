/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 color slider 类型契约。

import type { Direction, MachineSchema, Orientation, PropTypes, Service, Size } from '@xihan-ui/core'
import type { ColorAnchor, ColorChannel, ColorFormat, ColorHsva, ColorRgba } from '../shared/color'
import type { SliderSchema } from '../slider'

/** 读屏用的文案，默认英文。滑杆没有可见标题时名字只能从这里来。 */
export interface ColorSliderTranslations {
  /** 滑块的名字，按通道给。 */
  label: (channel: ColorChannel) => string
  /** 播报文本（带单位的那一版：色相是角度，百分数与 0-255 各按各的说）。 */
  valueText: (channel: ColorChannel, value: number) => string
}

/**
 * 颜色滑块跑起来要的两台机器：自己一台持有颜色，一台内嵌滑杆管拖动、键盘与几何。
 *
 * 滑杆的区间、步长与当下的值都受控于颜色滑块，推动经 CHANNEL.SET 送回来；
 * 轨道矩形由适配器接到那台滑杆的 getTrackEl 上。
 */
export interface ColorSliderServices {
  root: Service<ColorSliderSchema>
  slider: Service<SliderSchema>
}

export interface ColorSliderValueChangeDetails {
  /** 按 format 序列化好的值串。 */
  value: string
  /**
   * 这一下产出的工作色。串是有损的：灰度处色相、全透明处三个分量都写不进串里，
   * 几条并排的滑块要共用同一份工作色（取色器就是这样接它们的），只能从这里拿。
   */
  hsva: ColorHsva
}

export interface ColorSliderSchema extends MachineSchema {
  props: {
    /** 颜色值串。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 */
    value?: string
    defaultValue?: string
    /** 推的是哪一路：色相 / 饱和度 / 明度 / 透明度 / 红 / 绿 / 蓝，默认 hue。 */
    channel?: ColorChannel
    /** 值串的写法，默认 hex。改它只改对外的序列化，工作色恒是 HSVA。 */
    format?: ColorFormat
    /**
     * 受控的工作色。给定时本通道以外的分量、灰度处的色相都以它为准，不再从值串反解：
     * 取色器把同一份工作色交给几条并排的滑块，推色相那条时饱和度与明度不会被值串抹掉。
     * 单独用一条滑块时不必给，滑块自己记着锚。
     */
    hsva?: ColorHsva
    /**
     * 值串带不带透明度。默认跟着通道走：推透明度那一路时带，其余不带。
     * 显式给 true 时别的通道也保留透明度（与一条透明度滑块并排时要开它，否则推色相会把透明度归 1）。
     */
    alpha?: boolean
    orientation?: Orientation
    /** 文字方向。只改写水平轨道上左右两键与指针的语义。 */
    dir?: Direction
    disabled?: boolean
    readOnly?: boolean
    invalid?: boolean
    /** 尺寸：sm / md / lg，决定拇指直径与轨道厚度。 */
    size?: Size
    /** 表单字段名；给了表单影子才带 name 并参与提交。 */
    name?: string
    translations?: Partial<ColorSliderTranslations>
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。拖动过程中会连续发。 */
    onValueChange?: (details: ColorSliderValueChangeDetails) => void
    /** 只在一次操作结束时发一次，适合拿来发请求。 */
    onValueChangeEnd?: (details: ColorSliderValueChangeDetails) => void
  }
  context: {
    /** 值串。受控（value 给定）时 cell 直读 prop。 */
    value: string
    /** 工作色的锚：上一次由内部操作产出的 HSVA 与它对应的串，灰度处的色相靠它保住。 */
    anchor: ColorAnchor | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'idle'
  event:
    /** 整体改写颜色（外部 setValue 走它）；解析失败时原值不动。 */
    | { type: 'VALUE.SET', value: string }
    /** 内嵌滑杆推过来的对外数值（角度 / 百分数 / 0-255），改的是本滑块那一路。 */
    | { type: 'CHANNEL.SET', value: number }
    /** 一次推动结束（松手、键盘一下）；只用来转发 onValueChangeEnd。 */
    | { type: 'CHANGE.END' }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'canInteract'
  action: 'setValue' | 'setChannel' | 'invokeChangeEnd' | 'resetToDefault'
  effect: never
}

export interface ColorSliderApi<T extends PropTypes = PropTypes> {
  /** 当前值串（与 onValueChange 送出的是同一个）。 */
  value: string
  channel: ColorChannel
  /** 本通道此刻的对外数值（色相是角度，饱和度 / 明度 / 透明度是百分数，红绿蓝是 0-255）。 */
  channelValue: number
  /** 值在轨道上的位置，0-1。按未取整的工作色算，比滑杆按整格算的那一份更贴当前颜色。 */
  percent: number
  min: number
  max: number
  hsva: ColorHsva
  rgba: ColorRgba
  disabled: boolean
  readOnly: boolean
  /** 指针正拖着拇指。 */
  dragging: boolean
  setValue: (next: string) => void
  /** 直接把本通道推到某个对外数值。 */
  setChannelValue: (next: number) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getControlProps: () => T['element']
  /** 轨道：渐变由连接层按当前颜色现算写成内联 background-image。 */
  getTrackProps: () => T['element']
  getThumbProps: () => T['element']
  getValueTextProps: () => T['element']
  /** 表单影子：值随表单提交。给了 name 才带 name，不给就不参与提交。 */
  getHiddenInputProps: () => T['input']
}
