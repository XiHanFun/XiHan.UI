import type { RuntimeConfig, Service } from '@xihan-ui/core'
import type { ToolCallApi, ToolCallProps, ToolCallSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { createRuntimeConfig } from '@xihan-ui/core'
import { connectToolCall, toolCallMachine } from '@xihan-ui/headless'
import { useMemo, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlayExit } from '../../runtime/use-overlay-exit'

type MachineProps = ToolCallSchema['props']

export interface ToolCallContext {
  service: Service<ToolCallSchema>
  api: ToolCallApi
  contentRef: RefObject<HTMLElement | null>
  /** 收起动画播完之前保持为真：真正的收起由它落成内联 display。 */
  visible: boolean
}

// 机器属性与视图属性分开传：视图那一半走 connect 第二参，不经机器名分桶的全局文案
export function useToolCall(machineProps: MachineProps, viewProps: ToolCallProps): ToolCallContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const service = useMachine(toolCallMachine, () => machineProps, { scope })
  const api = connectToolCall(service, viewProps, reactNormalize)
  const contentRef = useRef<HTMLElement | null>(null)

  // 服务端没有 DOM、也就没有退场：config 传 null 时闸门退化成「跟着展开态」
  const config = useMemo<RuntimeConfig | null>(
    () => (typeof document === 'undefined' ? null : createRuntimeConfig({ scope, idGenerator })),
    [scope, idGenerator],
  )

  const visible = useOverlayExit({ config, isOpen: () => api.open, contentRef })
  return { service, api, contentRef, visible }
}
