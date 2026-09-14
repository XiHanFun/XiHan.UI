/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use color picker 相关实现。

import type { Layer, MachineSchema, Service } from '@xihan-ui/core'
import type { ColorPickerApi, ColorPickerSchema, ColorPickerServices, ColorSliderSchema, SliderSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import type { OverlayWiring } from '../../runtime/use-overlay'
import type { ColorSliderContext } from '../color-slider/use-color-slider'
import type { ColorSwatchPickerContext } from '../color-swatch-picker/use-color-swatch-picker'
import {
  colorPickerAlphaSliderProps,
  colorPickerHueSliderProps,
  colorPickerMachine,
  colorPickerSwatchPickerProps,
  colorSliderMachine,
  colorSliderSliderProps,
  colorSwatchPickerMachine,
  connectColorPicker,
  sliderMachine,
} from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { useCallback, useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'

export interface ColorPickerContext extends OverlayWiring {
  service: Service<ColorPickerSchema>
  api: ColorPickerApi
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
  /** 触发器，同时是浮层的定位锚点。 */
  triggerRef: RefObject<HTMLElement | null>
  /** 被定位的浮层壳。 */
  positionerRef: RefObject<HTMLElement | null>
  /** 浮层本体，退场动画从它身上探测。 */
  contentRef: RefObject<HTMLElement | null>
  /** 二维取色区，机器在指针事件里拿它量矩形。 */
  areaRef: RefObject<HTMLElement | null>
  /**
   * 三件内嵌组件各自的上下文：挂载点部件把它们 provide 下去，
   * 作者在挂载点里摆的就是 XhColorSlider* / XhColorSwatchPicker* 那些普通部件。
   */
  hueSlider: ColorSliderContext
  alphaSlider: ColorSliderContext
  swatchPicker: ColorSwatchPickerContext
}

export function useColorPicker(props: ColorPickerSchema['props']): ColorPickerContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const positionerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  const areaRef = useRef<HTMLElement | null>(null)
  const serviceRef = useRef<Service<ColorPickerSchema> | null>(null)
  // 两条滑块各自的轨道节点，只在指针事件里读；挂载点没有自己的 rootRef，表单重置由取色器的根统一接
  const hueTrackRef = useRef<HTMLElement | null>(null)
  const alphaTrackRef = useRef<HTMLElement | null>(null)

  const initialOpen = (props.open ?? props.defaultOpen) ?? false

  const layer = useCallback((): Omit<Layer, 'id' | 'node' | 'surfaces'> => ({
    kind: 'popover',
    // 触发器记为本层分支，点它算层内交互；
    // 浮层壳一并记上：content 之外还浮着自绘滚动条，按住它拖动不该把浮层消解掉
    branches: () => [triggerRef.current, positionerRef.current].filter(Boolean) as Element[],
    isModal: () => false,
  }), [])

  const overlay = useOverlay({
    scope,
    idGenerator,
    initialOpen,
    // 展开是复合状态，state.get() 拿到的是叶子路径（open.idle 之类），一律用 matches 判
    isOpen: () => serviceRef.current?.state.matches('open') ?? false,
    layer,
    node: () => contentRef.current,
    refs: (service: Service<MachineSchema>) => {
      // 定位引擎由适配器注入，机器只经端口驱动
      service.refs.set('position', createPositionEngine() as never)
      service.refs.set('getAnchorEl', (() => triggerRef.current) as never)
      service.refs.set('getFloatingEl', (() => positionerRef.current) as never)
      service.refs.set('getContentEl', (() => contentRef.current) as never)
      // 传 getter 而非节点，ref 在挂载后才有值
      service.refs.set('getAreaEl', (() => areaRef.current) as never)
    },
  })

  const service = useMachine(colorPickerMachine, () => props, {
    scope,
    onCreate: overlay.onCreate as never,
  })
  serviceRef.current = service

  // 轨道的矩形归各条滑块内嵌的那台滑杆量；机器的挂载效应会立刻读 refs，交在 onCreate 里才赶得上
  const onHueCreate = useCallback((slider: Service<SliderSchema>) => {
    slider.refs.set('getTrackEl', () => hueTrackRef.current)
  }, [])
  const onAlphaCreate = useCallback((slider: Service<SliderSchema>) => {
    slider.refs.set('getTrackEl', () => alphaTrackRef.current)
  }, [])
  // 两条颜色滑块各自一台机器再各内嵌一台滑杆：值与工作色从取色器现读，取色器须先建立；
  // 几台共用一份 scope，part id 里带组件名区分，不会撞
  const hueRoot = useMachine<ColorSliderSchema>(colorSliderMachine, () => colorPickerHueSliderProps(service), { scope })
  const hueSliderMachine = useMachine(sliderMachine, () => colorSliderSliderProps(hueRoot), { scope, onCreate: onHueCreate })
  const alphaRoot = useMachine<ColorSliderSchema>(colorSliderMachine, () => colorPickerAlphaSliderProps(service), { scope })
  const alphaSliderMachine = useMachine(sliderMachine, () => colorSliderSliderProps(alphaRoot), { scope, onCreate: onAlphaCreate })
  const swatchPickerService = useMachine(colorSwatchPickerMachine, () => colorPickerSwatchPickerProps(service), { scope })
  const services: ColorPickerServices = {
    root: service,
    hueSlider: { root: hueRoot, slider: hueSliderMachine },
    alphaSlider: { root: alphaRoot, slider: alphaSliderMachine },
    swatchPicker: swatchPickerService,
  }

  // 颜色攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置颜色不变
  useFormReset(service, rootRef)

  const api = connectColorPicker(services, reactNormalize)
  // 内嵌组件的 api 从取色器那份 api 上取：同一帧算好的同一份，不另连一次
  const hueSlider: ColorSliderContext = { api: api.hueSlider, service: hueRoot, trackRef: hueTrackRef, rootRef }
  const alphaSlider: ColorSliderContext = { api: api.alphaSlider, service: alphaRoot, trackRef: alphaTrackRef, rootRef }
  const swatchPicker: ColorSwatchPickerContext = { api: api.swatchPicker, service: swatchPickerService, rootRef }

  return {
    ...overlay,
    service,
    api,
    rootRef,
    triggerRef,
    positionerRef,
    contentRef,
    areaRef,
    hueSlider,
    alphaSlider,
    swatchPicker,
  }
}
