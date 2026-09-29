/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use tooltip 相关实现。

import type { Layer, Service } from '@xihan-ui/core'
import type { TooltipSchema } from '@xihan-ui/headless'
import type { TooltipContext } from './context'
import { connectTooltip, tooltipMachine } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { useCallback, useContext, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'
import { TooltipGroupContext } from './context'

export function useTooltip(props: TooltipSchema['props']): TooltipContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const triggerRef = useRef<HTMLElement | null>(null)
  const positionerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  const serviceRef = useRef<Service<TooltipSchema> | null>(null)
  // 放在 XhTooltipProvider 里就归它那一组：共用接替窗口、同组只开一个、延时取组的缺省
  const group = useContext(TooltipGroupContext)

  const initialOpen = (props.open ?? props.defaultOpen) ?? false

  const layer = useCallback((): Omit<Layer, 'id' | 'node' | 'surfaces'> => ({
    // 提示只参与 Escape 仲裁与栈顶判定：不陷焦点、不锁滚动、没有遮罩
    kind: 'inline',
    // trigger 记为本层分支，点它算层内交互
    branches: () => [triggerRef.current].filter(Boolean) as Element[],
    isModal: () => false,
  }), [])

  const overlay = useOverlay({
    scope,
    idGenerator,
    initialOpen,
    // visible 是复合态，closing 子态下浮层仍可见，进出场按父状态判
    isOpen: () => serviceRef.current?.state.matches('visible') ?? false,
    layer,
    node: () => contentRef.current,
    refs: (service) => {
      // 定位引擎由适配器注入，机器只经端口驱动
      service.refs.set('position', createPositionEngine() as never)
      service.refs.set('getAnchorEl', (() => triggerRef.current) as never)
      service.refs.set('getFloatingEl', (() => positionerRef.current) as never)
      service.refs.set('group', group as never)
    },
  })

  const service = useMachine(tooltipMachine, () => props, {
    scope,
    onCreate: overlay.onCreate as never,
  })
  serviceRef.current = service

  return {
    ...overlay,
    service,
    api: connectTooltip(service, reactNormalize),
    triggerRef,
    positionerRef,
    contentRef,
  }
}
