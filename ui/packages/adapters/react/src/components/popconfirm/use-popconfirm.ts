import type { Layer, Service } from '@xihan-ui/core'
import type { PopconfirmApi, PopconfirmConfirmErrorDetails, PopconfirmIntents, PopconfirmNotifiers, PopconfirmOverlayProps, PopoverSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import type { OverlayWiring } from '../../runtime/use-overlay'
import { connectPopconfirm, popoverMachine } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { useCallback, useRef, useState } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'

export interface PopconfirmContext extends OverlayWiring {
  service: Service<PopoverSchema>
  api: PopconfirmApi
  /** 定位锚点。 */
  triggerRef: RefObject<HTMLElement | null>
  /** 被定位的浮层壳。 */
  positionerRef: RefObject<HTMLElement | null>
  /** 浮层本体，退场动画从它身上探测。 */
  contentRef: RefObject<HTMLElement | null>
}

export function usePopconfirm(
  props: PopconfirmOverlayProps,
  notify?: PopconfirmNotifiers,
): PopconfirmContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const triggerRef = useRef<HTMLElement | null>(null)
  const positionerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  const serviceRef = useRef<Service<PopoverSchema> | null>(null)

  const initialOpen = (props.open ?? props.defaultOpen) ?? false
  // 事务状态既要进 React 渲染，也要同步落 ref：确认回调返回 thenable 的同一拍里，
  // Escape / 层外交互就可能到达机器，不能等下一轮渲染才开始拦截。
  const [pending, setPendingState] = useState(false)
  const pendingRef = useRef(false)
  const [actionError, setActionError] = useState<PopconfirmConfirmErrorDetails | null>(null)

  const layer = useCallback((): Omit<Layer, 'id' | 'node' | 'surfaces'> => ({
    kind: 'popover',
    // trigger 记为本层分支，点它算层内交互
    branches: () => [triggerRef.current].filter(Boolean) as Element[],
    // 气泡确认不陷焦点、不锁滚动、无遮罩
    isModal: () => false,
  }), [])

  const overlay = useOverlay({
    scope,
    idGenerator,
    initialOpen,
    isOpen: () => serviceRef.current?.state.get() === 'open',
    layer,
    node: () => contentRef.current,
    refs: (service) => {
      // 定位引擎由适配器注入，机器只经端口驱动
      service.refs.set('position', createPositionEngine() as never)
      service.refs.set('getAnchorEl', (() => triggerRef.current) as never)
      service.refs.set('getFloatingEl', (() => positionerRef.current) as never)
      service.refs.set('getContentEl', (() => contentRef.current) as never)
    },
  })

  // 开合、定位、消解层与焦点域全交给 popover 机器；气泡确认只多出确认/取消两个意图，
  // 它们不改开合以外的状态，走 connect 不进机器。
  // modal 与 translations 不往下传：不陷焦点，按钮文案由作者写在节点里。
  // 每帧现搭这份 props，消解那一刻读到的 closeOnEscape / closeOnInteractOutside 就是此刻这一份
  const service = useMachine(popoverMachine, (): PopoverSchema['props'] => ({
    open: props.open,
    defaultOpen: props.defaultOpen,
    placement: props.placement,
    offset: props.offset,
    closeOnEscape: pendingRef.current ? false : props.closeOnEscape,
    closeOnInteractOutside: pendingRef.current ? false : props.closeOnInteractOutside,
    size: props.size,
    onOpenChange: notify?.onOpenChange,
  }), {
    scope,
    onCreate: overlay.onCreate as never,
  })
  serviceRef.current = service

  // 每次点击现读 notify，宿主换回调也立刻生效；onConfirm 的返回值原样透传，异步门靠它
  const notifyRef = useRef(notify)
  notifyRef.current = notify
  const intents: PopconfirmIntents = {
    onConfirm: () => notifyRef.current?.onConfirm?.(),
    onConfirmError: details => notifyRef.current?.onConfirmError?.(details),
    onCancel: () => { notifyRef.current?.onCancel?.() },
    pending,
    onPendingChange: (next) => {
      pendingRef.current = next
      setPendingState(next)
    },
    actionError,
    onActionErrorChange: setActionError,
  }

  return {
    ...overlay,
    service,
    api: connectPopconfirm(service, intents, reactNormalize),
    triggerRef,
    positionerRef,
    contentRef,
  }
}
