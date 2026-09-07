import type { Layer, MachineSchema, Service } from '@xihan-ui/core'
import type { ColorPickerApi, ColorPickerChannel, ColorPickerSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import type { OverlayWiring } from '../../runtime/use-overlay'
import { colorPickerMachine, connectColorPicker } from '@xihan-ui/headless'
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
  /** 逐条登记通道轨道节点，由滑杆的轨道部件自报是哪一条。 */
  setChannelTrack: (channel: ColorPickerChannel, el: HTMLElement | null) => void
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
  // 普通对象而非状态，这两个节点只在指针事件里读
  const channelTracks = useRef<Record<ColorPickerChannel, HTMLElement | null>>({ hue: null, alpha: null })

  const initialOpen = (props.open ?? props.defaultOpen) ?? false

  const layer = useCallback((): Omit<Layer, 'id' | 'node' | 'surfaces'> => ({
    kind: 'popover',
    // 触发器记为本层分支，点它算层内交互；
    // 浮层壳一并记上：content 之外还浮着自绘滚动条，按住它拖动不该把浮层消解掉
    branches: () => [triggerRef.current, positionerRef.current].filter(Boolean) as Element[],
    isModal: () => false,
    setModal: () => {},
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
      service.refs.set('getChannelTrackEl', ((channel: ColorPickerChannel) => channelTracks.current[channel]) as never)
    },
  })

  const service = useMachine(colorPickerMachine, () => props, {
    scope,
    onCreate: overlay.onCreate as never,
  })
  serviceRef.current = service

  // 颜色攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置颜色不变
  useFormReset(service, rootRef)

  return {
    ...overlay,
    service,
    api: connectColorPicker(service, reactNormalize),
    rootRef,
    triggerRef,
    positionerRef,
    contentRef,
    areaRef,
    setChannelTrack: (channel, el) => {
      channelTracks.current[channel] = el
    },
  }
}
