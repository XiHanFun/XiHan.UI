/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use color slider 相关实现。

import type { Service } from '@xihan-ui/core'
import type { ColorSliderApi, ColorSliderSchema, ColorSliderServices, SliderSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { colorSliderMachine, colorSliderSliderProps, connectColorSlider, sliderMachine } from '@xihan-ui/headless'
import { useCallback, useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface ColorSliderContext {
  api: ColorSliderApi
  service: Service<ColorSliderSchema>
  /** 轨道节点，内嵌滑杆在指针事件里拿它量矩形。 */
  trackRef: RefObject<HTMLElement | null>
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
}

export function useColorSlider(props: ColorSliderSchema['props']): ColorSliderContext {
  const scope = useReactScope()
  const trackRef = useRef<HTMLElement | null>(null)
  const rootRef = useRef<HTMLElement | null>(null)

  const service = useMachine(colorSliderMachine, () => props, { scope })

  // 轨道的矩形归内嵌那台滑杆量；机器的挂载效应会立刻读 refs，交在 onCreate 里才赶得上
  const onSliderCreate = useCallback((slider: Service<SliderSchema>) => {
    slider.refs.set('getTrackEl', () => trackRef.current)
  }, [])
  // 内嵌一台滑杆：区间与当下的值从颜色滑块现读，颜色滑块须先建立；
  // 两台共用一份 scope，part id 里带组件名区分，不会撞
  const slider = useMachine(sliderMachine, () => colorSliderSliderProps(service), { scope, onCreate: onSliderCreate })
  const services: ColorSliderServices = { root: service, slider }

  // 颜色攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置颜色不变
  useFormReset(service, rootRef)

  return { api: connectColorSlider(services, reactNormalize), service, trackRef, rootRef }
}
