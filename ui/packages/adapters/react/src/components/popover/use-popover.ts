/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use popover 相关实现。

import type { Layer, Service } from '@xihan-ui/core'
import type { PopoverApi, PopoverSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import type { TitleDescriptionPresence } from '../../runtime/title-description'
import type { OverlayWiring } from '../../runtime/use-overlay'
import { connectPopover, popoverMachine } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { useCallback, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useTitleDescriptionPresence } from '../../runtime/title-description'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'

export interface PopoverContext extends OverlayWiring {
  service: Service<PopoverSchema>
  api: PopoverApi
  /** trigger 部件；没给 anchor 时它就是定位锚点。 */
  triggerRef: RefObject<HTMLElement | null>
  /**
   * 落点的视觉环境从哪取：缺省取 trigger；写了 anchor（哪怕暂时是 null，例如回调 ref 的首帧）时为空，
   * 由 Portal 在 positioner 原位放来源标记。
   */
  portalSource: RefObject<HTMLElement | null> | undefined
  /** 被定位的浮层壳。 */
  positionerRef: RefObject<HTMLElement | null>
  /** 浮层本体，退场动画从它上面探测。 */
  contentRef: RefObject<HTMLElement | null>
  /** 标题与说明在不在场，由 XhPopoverTitle / XhPopoverDescription 登记；content 只引用在场的部件。 */
  presence: TitleDescriptionPresence
}

export function usePopover(props: PopoverSchema['props']): PopoverContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const triggerRef = useRef<HTMLElement | null>(null)
  const positionerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  const serviceRef = useRef<Service<PopoverSchema> | null>(null)
  const modalRef = useRef(props.modal)
  modalRef.current = props.modal
  const anchorRef = useRef(props.anchor)
  anchorRef.current = props.anchor

  const initialOpen = (props.open ?? props.defaultOpen) ?? false

  const layer = useCallback((): Omit<Layer, 'id' | 'node' | 'surfaces'> => ({
    kind: 'popover',
    // trigger 记为本层分支，点它算层内交互；外部锚点同理，点它交给打开它的那条命令去切换。
    // 浮层壳一并记上：面板之外还浮着自绘滚动条，按住它拖动不该把面板消解掉
    branches: () => [triggerRef.current, anchorRef.current, positionerRef.current].filter(Boolean) as Element[],
    isModal: () => modalRef.current ?? false,
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
      service.refs.set('position', createPositionEngine())
      service.refs.set('getAnchorEl', () => triggerRef.current)
      service.refs.set('getFloatingEl', () => positionerRef.current)
      service.refs.set('getContentEl', () => contentRef.current)
    },
  })

  const presence = useTitleDescriptionPresence()
  const service = useMachine(popoverMachine, () => ({ ...props, parts: presence.parts }), {
    scope,
    onCreate: overlay.onCreate as never,
  })
  serviceRef.current = service

  return {
    ...overlay,
    service,
    api: connectPopover(service, reactNormalize),
    triggerRef,
    portalSource: props.anchor !== undefined ? undefined : triggerRef,
    positionerRef,
    contentRef,
    presence,
  }
}
