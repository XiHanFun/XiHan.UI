import type { RuntimeConfig, Service } from '@xihan-ui/core'
import type { CollapsibleApi, CollapsibleSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { createRuntimeConfig } from '@xihan-ui/core'
import { collapsibleMachine, connectCollapsible } from '@xihan-ui/headless'
import { useMemo, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlayExit } from '../../runtime/use-overlay-exit'

export interface CollapsibleContext {
  api: CollapsibleApi
  service: Service<CollapsibleSchema>
  contentRef: RefObject<HTMLElement | null>
  /** 收起动画播完之前保持为真：真正的收起由它落成内联 display。 */
  visible: boolean
}

export function useCollapsible(props: CollapsibleSchema['props']): CollapsibleContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const service = useMachine(collapsibleMachine, () => props, { scope })
  const api = connectCollapsible(service, reactNormalize)
  const contentRef = useRef<HTMLElement | null>(null)

  // 服务端没有 DOM、也就没有退场：config 传 null 时闸门退化成「跟着展开态」
  const config = useMemo<RuntimeConfig | null>(
    () => (typeof document === 'undefined' ? null : createRuntimeConfig({ scope, idGenerator })),
    [scope, idGenerator],
  )

  const visible = useOverlayExit({ config, isOpen: () => api.open, contentRef })
  return { api, service, contentRef, visible }
}
