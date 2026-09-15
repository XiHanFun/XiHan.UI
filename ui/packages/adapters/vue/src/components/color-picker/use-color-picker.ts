/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use color picker 相关实现。

import type { Cleanup, Layer, RuntimeConfig, Service } from '@xihan-ui/core'
import type { ColorPickerApi, ColorPickerSchema, ColorPickerServices, ColorSliderSchema, ColorSliderServices, SliderSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import type { ColorSliderContext } from '../color-slider/use-color-slider'
import type { ColorSwatchPickerContext } from '../color-swatch-picker/use-color-swatch-picker'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
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
import { computed, ref } from 'vue'
import { useXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface ColorPickerContext {
  service: Service<ColorPickerSchema>
  api: ComputedRef<ColorPickerApi>
  /** 触发器，同时是浮层的定位锚点。 */
  triggerRef: Ref<HTMLElement | null>
  positionerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
  /** 当前是否应当渲染：退场动画播完之前仍为真。 */
  visible: Ref<boolean>
  /** 二维取色区，状态机在指针事件中读取它的矩形。 */
  areaRef: Ref<HTMLElement | null>
  /**
   * 三个内嵌组件各自的上下文：挂载点部件把它们 provide 下去，
   * 作者在挂载点中放置的就是 XhColorSlider* / XhColorSwatchPicker* 普通部件。
   */
  hueSlider: ColorSliderContext
  alphaSlider: ColorSliderContext
  swatchPicker: ColorSwatchPickerContext
  /** 浮层迁移到的位置：全局配置的 portalContainer > body。 */
  portalTarget: ComputedRef<string | Element>
}

export function useColorPicker(
  props: ColorPickerSchema['props'],
  handlers: Pick<ColorPickerSchema['props'], 'onValueChange' | 'onOpenChange' | 'onColorError'> = {},
): ColorPickerContext {
  const xhConfig = useXhConfig()
  const triggerRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)
  const areaRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(colorPickerMachine, () => ({ ...props, ...handlers }), scope)

  // 两条颜色滑块各自一台机器再各内嵌一台滑杆：值与工作色从取色器现读，取色器须先建立；
  // 几台共用一份 scope，part id 里带组件名区分，不会撞
  const colorSlider = (sliderProps: (root: Service<ColorPickerSchema>) => ColorSliderSchema['props']): ColorSliderServices & { trackRef: Ref<HTMLElement | null> } => {
    const root = useMachine<ColorSliderSchema>(colorSliderMachine, () => sliderProps(service), scope)
    const slider = useMachine<SliderSchema>(sliderMachine, () => colorSliderSliderProps(root), scope)
    const trackRef = ref<HTMLElement | null>(null)
    // 传 getter 而非节点，轨道要到挂载后才有
    slider.refs.set('getTrackEl', () => trackRef.value)
    return { root, slider, trackRef }
  }
  const hue = colorSlider(colorPickerHueSliderProps)
  const alpha = colorSlider(colorPickerAlphaSliderProps)
  const swatchPicker = useMachine(colorSwatchPickerMachine, () => colorPickerSwatchPickerProps(service), scope)
  const services: ColorPickerServices = {
    root: service,
    hueSlider: { root: hue.root, slider: hue.slider },
    alphaSlider: { root: alpha.root, slider: alpha.slider },
    swatchPicker,
  }

  // 服务端没有 DOM、也就没有退场：config 传 null 时闸门退化成「跟着展开态」
  let config: RuntimeConfig | null = null

  if (typeof document !== 'undefined') {
    config = createRuntimeConfig({ scope, idGenerator: idGen })

    // 只提供注册函数，入栈出栈由机器的 trackLayer 效应按展开态驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config!.layerRegistry.register({
      kind: 'popover',
      node: () => contentRef.value,
      // 触发器记为本层分支，点它算层内交互；
      // 浮层壳一并记上：content 之外还浮着自绘滚动条，按住它拖动不该把浮层消解掉
      branches: () => [triggerRef.value, positionerRef.value].filter(Boolean) as Element[],
      isModal: () => false,
      // 浮层不带遮罩，没有可点关闭的表面
      surfaces: () => [],
    })

    // 定位引擎由适配器注入，机器只经端口驱动
    service.refs.set('config', config!)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('position', createPositionEngine())
    service.refs.set('getAnchorEl', () => triggerRef.value)
    service.refs.set('getFloatingEl', () => positionerRef.value)
    service.refs.set('getContentEl', () => contentRef.value)
    // 传 getter 而非节点，ref 在挂载后才有值
    service.refs.set('getAreaEl', () => areaRef.value)
  }

  const api = computed(() => connectColorPicker(services, vueNormalize))
  // 退场闸门：收起从跟着 open 走，改成跟着 presence 走
  const visible = useOverlayExit({
    config,
    isOpen: () => api.value.open,
    contentRef,
    onPresence: presence => service.refs.set('presence', presence),
  })
  // 先问全局配置的落点，没有才落 body
  const portalTarget = computed<string | Element>(() => xhConfig.value.portalContainer?.() ?? config?.portalContainer() ?? 'body')

  // 内嵌组件的 api 从取色器那份 api 上取：同一帧算好的同一份，不另连一次
  const hueSlider: ColorSliderContext = { api: computed(() => api.value.hueSlider), service: hue.root, trackRef: hue.trackRef }
  const alphaSlider: ColorSliderContext = { api: computed(() => api.value.alphaSlider), service: alpha.root, trackRef: alpha.trackRef }
  const swatchPickerCtx: ColorSwatchPickerContext = { api: computed(() => api.value.swatchPicker), service: swatchPicker }

  return {
    visible,
    service,
    api,
    triggerRef,
    positionerRef,
    contentRef,
    areaRef,
    hueSlider,
    alphaSlider,
    swatchPicker: swatchPickerCtx,
    portalTarget,
  }
}
