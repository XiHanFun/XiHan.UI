import type { ColorPickerApi, ColorPickerChannel, ColorPickerSchema } from '@xihan-ui/headless'
import type { Cleanup, Layer, RuntimeConfig } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { colorPickerMachine, connectColorPicker } from '@xihan-ui/headless'
import { createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { createPositionEngine } from '@xihan-ui/position'
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
  /** 二维取色区，机器在指针事件里拿它量矩形。 */
  areaRef: Ref<HTMLElement | null>
  /** 逐条登记通道轨道节点，由滑杆部件自报是哪一条。 */
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
  // 普通对象而非响应式引用，这两个节点只在指针事件里读
  const channelTracks: Record<ColorPickerChannel, HTMLElement | null> = { hue: null, alpha: null }

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(colorPickerMachine, () => ({ ...props, ...handlers }), scope)

  if (typeof document !== 'undefined') {
    const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })

    // 只提供注册函数，入栈出栈由机器的 trackLayer 效应按展开态驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
      kind: 'popover',
      node: () => contentRef.value,
      // 触发器记为本层分支，点它算层内交互
      branches: () => [triggerRef.value].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      // 浮层不带遮罩，没有可点关闭的表面
      surfaces: () => [],
    })

    // 定位引擎由适配器注入，机器只经端口驱动
    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('position', createPositionEngine())
    service.refs.set('getAnchorEl', () => triggerRef.value)
    service.refs.set('getFloatingEl', () => positionerRef.value)
    service.refs.set('getContentEl', () => contentRef.value)
    // 传 getter 而非节点，ref 在挂载后才有值
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
