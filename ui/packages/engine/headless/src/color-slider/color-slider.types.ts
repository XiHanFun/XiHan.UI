/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 color slider 类型契约。

import type { Direction, MachineSchema, Orientation, PropTypes, Service, Size } from '@xihan-ui/core'
import type { ColorAnchor, ColorChannel, ColorFormat, ColorHsva, ColorRgba } from '../shared/color'
import type { SliderSchema } from '../slider'

/** 读屏文案，默认英文。滑杆没有可见标题时名字只能来自这里。 */
export interface ColorSliderTranslations {
  /** 滑块的名字，按通道提供。 */
  label: (channel: ColorChannel) => string
  /** 播报文本（带单位的版本：色相为角度，百分数与 0-255 各按通道表述）。 */
  valueText: (channel: ColorChannel, value: number) => string
}

/**
 * 颜色滑块运行所需的两台状态机：自身一台持有颜色，一台内嵌滑杆负责拖动、键盘与几何。
 *
 * 滑杆的区间、步长与当前值都受控于颜色滑块，推动经 CHANNEL.SET 送回；
 * 轨道矩形由适配器接到该滑杆的 getTrackEl 上。
 */
export interface ColorSliderServices {
  root: Service<ColorSliderSchema>
  slider: Service<SliderSchema>
}

export interface ColorSliderValueChangeDetails {
  /** 按 format 序列化的值串。 */
  value: string
  /**
   * 本次产出的工作色。串是有损的：灰度处的色相、全透明处的三个分量都无法写入串，
   * 多条并排的滑块需要共用同一份工作色（取色器即如此接入），只能从这里获取。
   */
  hsva: ColorHsva
}

export interface ColorSliderSchema extends MachineSchema {
  props: {
    /** 颜色值串。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。 */
    value?: string
    defaultValue?: string
    /** 推动的通道：色相 / 饱和度 / 明度 / 透明度 / 红 / 绿 / 蓝，默认 hue。 */
    channel?: ColorChannel
    /** 值串的写法，默认 hex。修改它只改变对外的序列化，工作色恒为 HSVA。 */
    format?: ColorFormat
    /**
     * 受控的工作色。提供时本通道以外的分量、灰度处的色相都以它为准，不再从值串反解：
     * 取色器把同一份工作色交给多条并排的滑块，推动色相时饱和度与明度不会被值串抹除。
     * 单独使用一条滑块时不必提供，滑块自行记录锚点。
     */
    hsva?: ColorHsva
    /**
     * 值串是否带透明度。默认随通道决定：推动透明度通道时带，其余不带。
     * 显式提供 true 时其他通道也保留透明度（与一条透明度滑块并排时需开启，否则推动色相会把透明度归 1）。
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
    /** 表单字段名；提供后表单影子才带 name 并参与提交。 */
    name?: string
    translations?: Partial<ColorSliderTranslations>
    /** value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。拖动过程中连续发出。 */
    onValueChange?: (details: ColorSliderValueChangeDetails) => void
    /** 只在一次操作结束时发出一次，适合用于发起请求。 */
    onValueChangeEnd?: (details: ColorSliderValueChangeDetails) => void
  }
  context: {
    /** 值串。受控（value 提供）时 cell 直读 prop。 */
    value: string
    /** 工作色的锚：上一次由内部操作产出的 HSVA 与对应的串，灰度处的色相依靠它保留。 */
    anchor: ColorAnchor | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'idle'
  event:
    /** 整体改写颜色（外部 setValue 经过它）；解析失败时原值不变。 */
    | { type: 'VALUE.SET', value: string }
    /** 内嵌滑杆推来的对外数值（角度 / 百分数 / 0-255），修改的是本滑块的通道。 */
    | { type: 'CHANNEL.SET', value: number }
    /** 一次推动结束（松开、键盘一次）；只用于转发 onValueChangeEnd。 */
    | { type: 'CHANGE.END' }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'canInteract'
  action: 'setValue' | 'setChannel' | 'invokeChangeEnd' | 'resetToDefault'
  effect: never
}

export interface ColorSliderApi<T extends PropTypes = PropTypes> {
  /** 当前值串（与 onValueChange 发出的是同一个）。 */
  value: string
  channel: ColorChannel
  /** 本通道当前的对外数值（色相为角度，饱和度 / 明度 / 透明度为百分数，红绿蓝为 0-255）。 */
  channelValue: number
  /** 值在轨道上的位置，0-1。按未取整的工作色计算，比滑杆按整格计算的值更贴近当前颜色。 */
  percent: number
  min: number
  max: number
  hsva: ColorHsva
  rgba: ColorRgba
  disabled: boolean
  readOnly: boolean
  /** 指针正在拖动拇指。 */
  dragging: boolean
  setValue: (next: string) => void
  /** 直接把本通道推到某个对外数值。 */
  setChannelValue: (next: number) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getControlProps: () => T['element']
  /** 轨道：渐变由连接层按当前颜色计算并写为内联 background-image。 */
  getTrackProps: () => T['element']
  getThumbProps: () => T['element']
  getValueTextProps: () => T['element']
  /** 表单影子：值随表单提交。提供 name 后才带 name，未提供时不参与提交。 */
  getHiddenInputProps: () => T['input']
}
