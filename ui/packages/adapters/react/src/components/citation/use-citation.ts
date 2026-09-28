/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use citation 相关实现。

import type { Cleanup, Layer, RuntimeConfig, Service } from '@xihan-ui/core'
import type { CitationApi, CitationSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { createRuntimeConfig } from '@xihan-ui/core'
import { citationAnatomy, citationMachine, connectCitation } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { useCallback, useMemo, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

const triggerSelector = citationAnatomy.build().trigger.selector

export interface CitationContext {
  api: CitationApi
  service: Service<CitationSchema>
  /** 根节点：悬停卡片搬到 portal 落点时，视觉轴从这里桥过去。 */
  rootRef: RefObject<HTMLDivElement | null>
  /** hover 档的定位壳。 */
  positionerRef: RefObject<HTMLDivElement | null>
}

export function useCitation(props: CitationSchema['props']): CitationContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const positionerRef = useRef<HTMLDivElement | null>(null)

  // 无 DOM 环境（SSR）不建引擎与消解层：hover 档的卡片首屏本来就收着
  const config = useMemo<RuntimeConfig | null>(
    () => (typeof document === 'undefined' ? null : createRuntimeConfig({ scope, idGenerator })),
    [scope, idGenerator],
  )

  const onCreate = useCallback((service: Service<CitationSchema>): (() => void) => {
    service.refs.set('getFloatingEl', () => positionerRef.current)
    if (config === null)
      return () => {}
    // 只提供注册函数，入栈出栈由机器按卡片开合驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
      kind: 'popover',
      node: () => positionerRef.current,
      // 行内引用记为本层分支：按在另一处引用上是切换，不是层外交互
      branches: () => [...(rootRef.current?.querySelectorAll<HTMLElement>(triggerSelector) ?? [])],
      isModal: () => false,
      surfaces: () => [],
    })
    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('position', createPositionEngine())
    return () => {}
  }, [config])

  const service = useMachine(citationMachine, () => props, { scope, onCreate: onCreate as never })
  return { api: connectCitation(service, reactNormalize), service, rootRef, positionerRef }
}
