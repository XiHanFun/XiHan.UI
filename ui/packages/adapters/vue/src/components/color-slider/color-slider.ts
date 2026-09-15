/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color slider 相关实现。

import type { Direction, Orientation, Size } from '@xihan-ui/core'
import type { ColorChannel, ColorFormat, ColorSliderApi, ColorSliderSchema, ColorSliderTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { useFormControlProps } from '../form/use-form-control'
import { provideColorSlider, useColorSliderContext } from './context'
import { useColorSlider } from './use-color-slider'

type ColorSliderProps = ColorSliderSchema['props']

export type ColorSliderRootSlotProps = Pick<
  ColorSliderApi,
  'value' | 'channel' | 'channelValue' | 'percent' | 'dragging' | 'setValue' | 'setChannelValue'
>

export const XhColorSliderRoot = defineComponent({
  name: 'XhColorSliderRoot',
  props: {
    /** 颜色值串；缺席即非受控。 */
    value: { type: String },
    defaultValue: { type: String },
    /** 调节的通道：hue / saturation / brightness / alpha / red / green / blue，默认 hue。 */
    channel: { type: String as PropType<ColorChannel> },
    /** 值串的写法：hex / rgba / hsla，默认 hex。 */
    format: { type: String as PropType<ColorFormat> },
    /** 值串是否带透明度；默认时调节透明度通道带、其余不带。 */
    alpha: { type: Boolean, default: undefined },
    orientation: { type: String as PropType<Orientation> },
    dir: { type: String as PropType<Direction> },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    size: { type: String as PropType<Size> },
    name: { type: String },
    translations: { type: Object as PropType<Partial<ColorSliderTranslations>> },
  },
  // value-change 携带 { value }，update:value 携带裸串；value-change-end 只在操作收尾时发一次
  emits: {
    'value-change': (_details: PayloadOf<ColorSliderProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<ColorSliderProps, 'onValueChange'>['value']) => true,
    'value-change-end': (_details: PayloadOf<ColorSliderProps, 'onValueChangeEnd'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: ColorSliderRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: ColorSliderProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyEnd: ColorSliderProps['onValueChangeEnd'] = (details) => {
      emit('value-change-end', details)
    }
    // withXhConfig 只能在 setup 期调，机器在运行期读这份代理
    const configured = withXhConfig('color-slider', useFormControlProps(props) as ColorSliderProps)
    const ctx = useColorSlider(configured, { onValueChange: notify, onValueChangeEnd: notifyEnd })
    provideColorSlider(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      value: ctx.api.value.value,
      channel: ctx.api.value.channel,
      channelValue: ctx.api.value.channelValue,
      percent: ctx.api.value.percent,
      dragging: ctx.api.value.dragging,
      setValue: ctx.api.value.setValue,
      setChannelValue: ctx.api.value.setChannelValue,
    }))
  },
})

export const XhColorSliderLabel = defineComponent({
  name: 'XhColorSliderLabel',
  setup(_, { slots }) {
    const ctx = useColorSliderContext()
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhColorSliderControl = defineComponent({
  name: 'XhColorSliderControl',
  setup(_, { slots }) {
    const ctx = useColorSliderContext()
    return () => h('div', ctx.api.value.getControlProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhColorSliderTrack = defineComponent({
  name: 'XhColorSliderTrack',
  setup(_, { slots }) {
    const ctx = useColorSliderContext()
    // 轨道节点交给内嵌滑杆，矩形在指针事件里现量
    return () => h('div', {
      ...ctx.api.value.getTrackProps() as Record<string, unknown>,
      ref: ctx.trackRef,
    }, slots.default?.())
  },
})

export const XhColorSliderThumb = defineComponent({
  name: 'XhColorSliderThumb',
  setup(_, { slots }) {
    const ctx = useColorSliderContext()
    return () => h('div', ctx.api.value.getThumbProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhColorSliderValueText = defineComponent({
  name: 'XhColorSliderValueText',
  setup(_, { slots }) {
    const ctx = useColorSliderContext()
    // 值气泡：没给内容就填本通道的当前数值
    return () => h(
      'span',
      ctx.api.value.getValueTextProps() as Record<string, unknown>,
      slots.default?.() ?? String(ctx.api.value.channelValue),
    )
  },
})

export const XhColorSliderHiddenInput = defineComponent({
  name: 'XhColorSliderHiddenInput',
  setup() {
    const ctx = useColorSliderContext()
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})
