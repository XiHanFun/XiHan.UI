/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use hover card 相关实现。

import type { Layer, Service } from '@xihan-ui/core'
import type { HoverCardApi, HoverCardSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import type { TitleDescriptionPresence } from '../../runtime/title-description'
import type { OverlayWiring } from '../../runtime/use-overlay'
import { connectHoverCard, hoverCardMachine } from '@xihan-ui/headless'
import { createDeferredPositionEngine } from '@xihan-ui/position'
import { useCallback, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useTitleDescriptionPresence } from '../../runtime/title-description'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'

export interface HoverCardContext extends OverlayWiring {
  service: Service<HoverCardSchema>
  api: HoverCardApi
  /** 定位锚点。 */
  triggerRef: RefObject<HTMLElement | null>
  /** 被定位的浮层壳。 */
  positionerRef: RefObject<HTMLElement | null>
  /** 浮层本体，退场动画从它上面探测。 */
  contentRef: RefObject<HTMLElement | null>
  /** 标题与说明在不在场，由 XhHoverCardTitle / XhHoverCardDescription 登记：title 不在场时卡片的可及名指回 trigger。 */
  presence: TitleDescriptionPresence
}

export function useHoverCard(props: HoverCardSchema['props']): HoverCardContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const triggerRef = useRef<HTMLElement | null>(null)
  const positionerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  const serviceRef = useRef<Service<HoverCardSchema> | null>(null)

  const presence = useTitleDescriptionPresence()

  const initialOpen = (props.open ?? props.defaultOpen) ?? false

  const layer = useCallback((): Omit<Layer, 'id' | 'node' | 'surfaces'> => ({
    kind: 'popover',
    // trigger 记为本层分支，指针按在它上面算层内交互；
    // 浮层壳一并记上：卡片之外还浮着自绘滚动条，按住它拖动不该把卡片消解掉
    branches: () => [triggerRef.current, positionerRef.current].filter(Boolean) as Element[],
    // 悬停卡片非模态：不陷焦点、不锁滚动、无遮罩
    isModal: () => false,
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
      service.refs.set('position', createDeferredPositionEngine())
      service.refs.set('getAnchorEl', () => triggerRef.current)
      service.refs.set('getFloatingEl', () => positionerRef.current)
      service.refs.set('getContentEl', () => contentRef.current)
    },
  })

  const service = useMachine(hoverCardMachine, () => ({ ...props, parts: presence.parts }), {
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
    presence,
  }
}
