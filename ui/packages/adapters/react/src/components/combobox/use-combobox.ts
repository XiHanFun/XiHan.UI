import type { Layer, Service } from '@xihan-ui/core'
import type { ComboboxApi, ComboboxInputEl, ComboboxSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import type { OverlayWiring } from '../../runtime/use-overlay'
import { comboboxMachine, connectCombobox } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { useCallback, useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'

export interface ComboboxContext extends OverlayWiring {
  /** 机器实例，供部件直接上报 DOM 侧事实。 */
  service: Service<ComboboxSchema>
  api: ComboboxApi
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
  controlRef: RefObject<HTMLElement | null>
  /** 输入宿主，input 或 textarea；由 XhComboboxInput 的 as 决定渲染成哪个。 */
  inputRef: RefObject<ComboboxInputEl | null>
  positionerRef: RefObject<HTMLElement | null>
  contentRef: RefObject<HTMLElement | null>
  /** 上报候选集合可能变了；同一拍里多次调用只上报一次。 */
  syncItems: () => void
}

export function useCombobox(props: ComboboxSchema['props']): ComboboxContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const controlRef = useRef<HTMLElement | null>(null)
  const inputRef = useRef<ComboboxInputEl | null>(null)
  const positionerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  const serviceRef = useRef<Service<ComboboxSchema> | null>(null)

  const initialOpen = (props.open ?? props.defaultOpen) ?? false

  const layer = useCallback((): Omit<Layer, 'id' | 'node' | 'surfaces'> => ({
    kind: 'popover',
    // 整个输入行记为本层分支，点输入框或触发按钮算层内交互；
    // 浮层壳一并记上：候选列表之外还浮着自绘滚动条，按住它拖动不该把列表消解掉
    branches: () => [controlRef.current, positionerRef.current].filter(Boolean) as Element[],
    isModal: () => false,
    setModal: () => {},
  }), [])

  const overlay = useOverlay({
    scope,
    idGenerator,
    initialOpen,
    isOpen: () => serviceRef.current?.state.get() === 'open',
    layer,
    node: () => contentRef.current,
    refs: (service) => {
      // 定位引擎由适配器注入，机器只经端口驱动；锚点取整个输入行
      service.refs.set('position', createPositionEngine() as never)
      service.refs.set('getAnchorEl', (() => controlRef.current) as never)
      service.refs.set('getFloatingEl', (() => positionerRef.current) as never)
      service.refs.set('getContentEl', (() => contentRef.current) as never)
      service.refs.set('getInputEl', (() => inputRef.current) as never)
    },
  })

  const service = useMachine(comboboxMachine, () => props, {
    scope,
    onCreate: overlay.onCreate as never,
  })
  serviceRef.current = service

  // 值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生
  useFormReset(service, rootRef)

  // 合并到下一拍统一上报：同一次提交里进出的候选各自调一次，只送一个事件
  const scheduled = useRef(false)
  const syncItems = useCallback(() => {
    if (scheduled.current)
      return
    scheduled.current = true
    queueMicrotask(() => {
      scheduled.current = false
      if (service.getStatus() === 'Started')
        service.send({ type: 'ITEMS.SYNC' })
    })
  }, [service])

  return {
    ...overlay,
    service,
    api: connectCombobox(service, reactNormalize),
    rootRef,
    controlRef,
    inputRef,
    positionerRef,
    contentRef,
    syncItems,
  }
}
