/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color slider 相关实现。

import type { Params, Service } from '@xihan-ui/core'
import type { ColorChannel, ColorHsva } from '../shared/color'
import type { SliderSchema } from '../slider'
import type { ColorSliderSchema } from './color-slider.types'
import { resetDeclaredValue, setup } from '@xihan-ui/core'
import {
  COLOR_FALLBACK,
  colorChannelRange,
  colorChannelValue,
  colorCss,
  colorHsvaToRgba,
  colorHueCss,
  colorParse,
  colorResolveFormat,
  colorResolveHsva,
  colorRgbaToHsva,
  colorToChannel,
  colorToString,
  colorWithChannel,
} from '../shared/color'

const { createMachine } = setup<ColorSliderSchema>()

type MachineParams = Params<ColorSliderSchema>

/** 透明度那一路默认带透明度，其余通道默认不带；显式给了 alpha 以它为准。 */
export function colorSliderAlpha(props: Pick<ColorSliderSchema['props'], 'alpha' | 'channel'>): boolean {
  return props.alpha ?? colorToChannel(props.channel) === 'alpha'
}

/** 当前工作色：值串加上锚。灰度处的色相由锚保住，详见 colorResolveHsva。 */
function currentHsva(params: MachineParams): ColorHsva {
  return colorResolveHsva(params.context.get('value'), params.context.get('anchor'))
}

/**
 * 落一个新的工作色。锚与值一起写。
 *
 * 受控时 context.set('value') 只发回调不落内部值，锚与当前值对不上，connect 退回按当前值反解。
 * 格式写错时不落值：静默换成 hex 会让宿主收到一种它没要过的写法。
 */
function applyHsva(params: MachineParams, next: ColorHsva): void {
  const { context, prop } = params
  const format = colorResolveFormat(prop('format') as string | undefined)
  if (!format)
    return
  const alpha = colorSliderAlpha({ alpha: prop('alpha'), channel: prop('channel') })
  const hsva: ColorHsva = alpha ? next : { ...next, a: 1 }
  const value = colorToString(colorHsvaToRgba(hsva), format, alpha)
  context.set('anchor', { value, hsva })
  context.set('value', value)
}

/**
 * 轨道上从 min 到 max 该画成什么：按当前颜色算，其余分量保持不动，只让本通道从头走到尾。
 * 方向由调用方给（水平按文字方向，竖直恒向上）。透明度那一路从全透明走到实色，棋盘格由皮肤垫在底下。
 */
export function colorSliderTrackGradient(hsva: ColorHsva, channel: ColorChannel, direction: 'right' | 'left' | 'top'): string {
  const stops = colorSliderTrackStops(hsva, channel)
  return `linear-gradient(to ${direction}, ${stops.join(', ')})`
}

/** 渐变的色标：色相走满七段等分角度，其余通道两端各一色。 */
export function colorSliderTrackStops(hsva: ColorHsva, channel: ColorChannel): string[] {
  if (channel === 'hue')
    return [0, 60, 120, 180, 240, 300, 360].map(colorHueCss)
  const range = colorChannelRange(channel)
  const at = (value: number): string => {
    const rgba = colorHsvaToRgba(colorWithChannel(hsva, channel, value))
    // 透明度以外的通道把 alpha 归 1：轨道画的是这一路的走向，不该跟着当前透明度一起淡
    return colorCss(channel === 'alpha' ? rgba : { ...rgba, a: 1 })
  }
  return [at(range.min), at(range.max)]
}

/**
 * 喂给内嵌滑杆的 props：区间、步长与当下的值都受控于颜色滑块，推动经回调送回来。
 * 只读只是改不动，Tab 位照留；禁用整条不可用。
 */
export function colorSliderSliderProps(service: Service<ColorSliderSchema>): SliderSchema['props'] {
  const { prop, context, send } = service
  const channel = colorToChannel(prop('channel'))
  const range = colorChannelRange(channel)
  const hsva = colorResolveHsva(context.get('value'), context.get('anchor'))
  return {
    value: [Math.round(colorChannelValue(hsva, channel))],
    min: range.min,
    max: range.max,
    step: range.step,
    largeStep: range.largeStep,
    orientation: prop('orientation') ?? 'horizontal',
    dir: prop('dir'),
    disabled: !!prop('disabled'),
    readOnly: !!prop('readOnly'),
    invalid: !!prop('invalid'),
    size: prop('size'),
    onValueChange: ({ value }) => {
      const next = value[0]
      if (Number.isFinite(next))
        send({ type: 'CHANNEL.SET', value: next! })
    },
    onValueChangeEnd: () => send({ type: 'CHANGE.END' }),
  }
}

// 值走 cell 原生受控（value 给定即受控）；拖动、键盘与几何都住在内嵌滑杆里，
// 这台机器只管「颜色串 ↔ 本通道数值」这一件事。
export const colorSliderMachine = createMachine({
  name: 'color-slider',
  context: ({ prop, cell }) => ({
    value: cell<string>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? COLOR_FALLBACK,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    anchor: cell<ColorSliderSchema['context']['anchor']>(() => ({ defaultValue: null })),
  }),
  refs: () => ({}),
  initialState: () => 'idle',
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
    'VALUE.SET': { guard: 'canInteract', actions: ['setValue'] },
    'CHANNEL.SET': { guard: 'canInteract', actions: ['setChannel'] },
    'CHANGE.END': { actions: ['invokeChangeEnd'] },
  },
  states: {
    idle: {},
  },
  implementations: {
    guards: {
      canInteract: ({ prop }) => !prop('disabled') && !prop('readOnly'),
    },
    actions: {
      resetToDefault: (params) => {
        if (params.prop('value') === undefined)
          params.context.reset('anchor')
        resetDeclaredValue(params, 'value', 'value', 'defaultValue')
      },

      // 解析不出的串原地不动：滑块没有错误通道，串的合法性由喂它的一方负责
      setValue: (params) => {
        const e = params.event.current()
        if (e.type !== 'VALUE.SET')
          return
        const rgba = colorParse(e.value)
        if (!rgba)
          return
        applyHsva(params, colorRgbaToHsva(rgba, currentHsva(params).h))
      },

      setChannel: (params) => {
        const e = params.event.current()
        if (e.type !== 'CHANNEL.SET')
          return
        const channel = colorToChannel(params.prop('channel'))
        applyHsva(params, colorWithChannel(currentHsva(params), channel, e.value))
      },

      invokeChangeEnd: ({ context, prop }) => {
        prop('onValueChangeEnd')?.({ value: context.get('value') })
      },
    },
  },
})
