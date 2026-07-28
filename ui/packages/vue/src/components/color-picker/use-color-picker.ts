import type { Cleanup, Layer, RuntimeConfig } from '@xihan-ui/core'
import type { ColorPickerApi, ColorPickerChannel, ColorPickerSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { colorPickerMachine, connectColorPicker } from '@xihan-ui/headless'
import { createFloatingUiPositionEngine } from '@xihan-ui/position-floating-ui'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface ColorPickerContext {
  service: Service<ColorPickerSchema>
  api: ComputedRef<ColorPickerApi>
  /** 触发器，同时是浮层的定位锚点。 */
  triggerRef: Ref<HTMLElement | null>
  positionerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
  /** 二维取色区。机器在指针事件那一刻拿它量矩形，connect 一律不碰 DOM。 */
  areaRef: Ref<HTMLElement | null>
  /** 通道轨道逐条登记：两条滑杆共用一个部件组件，只能由它自报是哪一条。 */
  setChannelTrack: (channel: ColorPickerChannel, el: HTMLElement | null) => void
}

export function useColorPicker(
  props: ColorPickerSchema['props'],
  handlers: Pick<ColorPickerSchema['props'], 'onValueChange' | 'onOpenChange'> = {},
): ColorPickerContext {
  const triggerRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)
  const areaRef = ref<HTMLElement | null>(null)
  // 普通对象而不是响应式引用：这两个节点只在指针事件那一刻被读一次，不参与渲染
  const channelTracks: Record<ColorPickerChannel, HTMLElement | null> = { hue: null, alpha: null }

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // 两个回调由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(colorPickerMachine, () => ({ ...props, ...handlers }), scope)

  if (typeof document !== 'undefined') {
    const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })

    // 只给注册函数、不在这里注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
    // 挂载期就注册会让层与开合无关地常驻栈里，把同页其它层的 Escape 堵死。
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
      kind: 'popover',
      node: () => contentRef.value,
      // 触发器记为本层分支：点它算层内交互，开合交给它自己切换。
      // 否则同一次点击先被判为层外交互关一次、再被 click 打开一次，等于关不掉。
      branches: () => [triggerRef.value].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      // 浮层不带遮罩，没有"点它就该关本层"的表面
      surfaces: () => [],
    })

    // 定位引擎由适配器建好注入；机器只经端口驱动，不认识具体引擎
    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('position', createFloatingUiPositionEngine())
    service.refs.set('getAnchorEl', () => triggerRef.value)
    service.refs.set('getFloatingEl', () => positionerRef.value)
    service.refs.set('getContentEl', () => contentRef.value)
    // 懒读而不是把节点直接塞进去：ref 在挂载后才有值，机器建起来的那一刻还是 null
    service.refs.set('getAreaEl', () => areaRef.value)
    service.refs.set('getChannelTrackEl', channel => channelTracks[channel])
  }

  const api = computed(() => connectColorPicker(service, vueNormalize))
  return {
    service,
    api,
    triggerRef,
    positionerRef,
    contentRef,
    areaRef,
    setChannelTrack: (channel, el) => {
      channelTracks[channel] = el
    },
  }
}
