import type { Layer, Service } from '@xihan-ui/core'
import type { HoverCardApi, HoverCardSchema } from '@xihan-ui/headless'
import type { RefCallback, RefObject } from 'react'
import type { OverlayWiring } from '../../runtime/use-overlay'
import { connectHoverCard, hoverCardMachine } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { useCallback, useRef, useState } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'

export interface HoverCardContext extends OverlayWiring {
  service: Service<HoverCardSchema>
  api: HoverCardApi
  /** 定位锚点。 */
  triggerRef: RefObject<HTMLElement | null>
  /** 被定位的浮层壳。 */
  positionerRef: RefObject<HTMLElement | null>
  /** 浮层本体，退场动画从它身上探测。 */
  contentRef: RefObject<HTMLElement | null>
  /** title 部件的落位口：它在不在场决定卡片的名字指向 title 还是 trigger。 */
  setTitleEl: RefCallback<HTMLElement>
  /** description 部件的落位口：它不在场时不发 aria-describedby。 */
  setDescriptionEl: RefCallback<HTMLElement>
}

export function useHoverCard(props: HoverCardSchema['props']): HoverCardContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const triggerRef = useRef<HTMLElement | null>(null)
  const positionerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  const titleRef = useRef<HTMLElement | null>(null)
  const descriptionRef = useRef<HTMLElement | null>(null)
  const serviceRef = useRef<Service<HoverCardSchema> | null>(null)

  // 名字链与说明链在连接期就要算出来，而 ref 落位不引发重渲：
  // 这两格状态记下两个可选部件在不在场，落位那一刻把属性重算一遍
  const [, setTitlePresent] = useState(false)
  const [, setDescriptionPresent] = useState(false)
  const setTitleEl = useCallback<RefCallback<HTMLElement>>((el) => {
    titleRef.current = el
    setTitlePresent(el != null)
  }, [])
  const setDescriptionEl = useCallback<RefCallback<HTMLElement>>((el) => {
    descriptionRef.current = el
    setDescriptionPresent(el != null)
  }, [])

  const initialOpen = (props.open ?? props.defaultOpen) ?? false

  const layer = useCallback((): Omit<Layer, 'id' | 'node' | 'surfaces'> => ({
    kind: 'popover',
    // trigger 记为本层分支，指针按在它上面算层内交互；
    // 浮层壳一并记上：卡片之外还浮着自绘滚动条，按住它拖动不该把卡片消解掉
    branches: () => [triggerRef.current, positionerRef.current].filter(Boolean) as Element[],
    // 悬停卡片非模态：不陷焦点、不锁滚动、无遮罩
    isModal: () => false,
    setModal: () => {},
  }), [])

  const overlay = useOverlay({
    scope,
    idGenerator,
    initialOpen,
    // visible 是复合态，closing 子态下卡片仍可见，进出场按父状态判
    isOpen: () => serviceRef.current?.state.matches('visible') ?? false,
    layer,
    node: () => contentRef.current,
    refs: (service) => {
      // 定位引擎由适配器注入，机器只经端口驱动
      service.refs.set('position', createPositionEngine() as never)
      service.refs.set('getAnchorEl', (() => triggerRef.current) as never)
      service.refs.set('getFloatingEl', (() => positionerRef.current) as never)
      service.refs.set('getContentEl', (() => contentRef.current) as never)
      service.refs.set('getTitleEl', (() => titleRef.current) as never)
      service.refs.set('getDescriptionEl', (() => descriptionRef.current) as never)
    },
  })

  const service = useMachine(hoverCardMachine, () => props, {
    scope,
    onCreate: overlay.onCreate as never,
  })
  serviceRef.current = service

  return {
    ...overlay,
    service,
    api: connectHoverCard(service, reactNormalize),
    triggerRef,
    positionerRef,
    contentRef,
    setTitleEl,
    setDescriptionEl,
  }
}
