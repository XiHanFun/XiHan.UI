/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use color slider 相关实现。

import type { Service } from '@xihan-ui/core'
import type { ColorSliderApi, ColorSliderSchema, ColorSliderServices, SliderSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { colorSliderMachine, colorSliderSliderProps, connectColorSlider, sliderMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface ColorSliderContext {
  api: ComputedRef<ColorSliderApi>
  service: Service<ColorSliderSchema>
  /** 轨道节点，内嵌滑杆在指针事件中读取它的矩形。 */
  trackRef: Ref<HTMLElement | null>
}

export function useColorSlider(
  props: ColorSliderSchema['props'],
  handlers: Pick<ColorSliderSchema['props'], 'onValueChange' | 'onValueChangeEnd'> = {},
): ColorSliderContext {
  const trackRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(colorSliderMachine, () => ({ ...props, ...handlers }), scope)

  // 内嵌一台滑杆：区间与当下的值从颜色滑块现读，颜色滑块须先建立；
  // 两台共用一份 scope，part id 里带组件名区分，不会撞
  const slider = useMachine<SliderSchema>(sliderMachine, () => colorSliderSliderProps(service), scope)
  // 传 getter 而非节点，轨道要到挂载后才有
  slider.refs.set('getTrackEl', () => trackRef.value)
  const services: ColorSliderServices = { root: service, slider }

  const api = computed(() => connectColorSlider(services, vueNormalize))
  return { api, service, trackRef }
}
