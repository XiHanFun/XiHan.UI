import type { RuntimeConfig, Service } from '@xihan-ui/core'
import type { ReasoningApi, ReasoningProps, ToolCallSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { createRuntimeConfig } from '@xihan-ui/core'
import { connectReasoning, toolCallMachine } from '@xihan-ui/headless'
import { useMemo, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlayExit } from '../../runtime/use-overlay-exit'

type MachineProps = ToolCallSchema['props']

export interface ReasoningContext {
  service: Service<ToolCallSchema>
  api: ReasoningApi
  contentRef: RefObject<HTMLElement | null>
  /** 收起动画播完之前保持为真：真正的收起由它落成内联 display。 */
  visible: boolean
}

// 自动开合整套复用 tool-call 的机器：它不认解剖，只认在不在跑与四个叶态
export function useReasoning(machineProps: MachineProps, viewProps: ReasoningProps): ReasoningContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const service = useMachine(toolCallMachine, () => machineProps, { scope })
  const api = connectReasoning(service, viewProps, reactNormalize)
  const contentRef = useRef<HTMLElement | null>(null)

  // 服务端没有 DOM、也就没有退场：config 传 null 时闸门退化成「跟着展开态」
  const config = useMemo<RuntimeConfig | null>(
    () => (typeof document === 'undefined' ? null : createRuntimeConfig({ scope, idGenerator })),
    [scope, idGenerator],
  )

  const visible = useOverlayExit({ config, isOpen: () => api.open, contentRef })
  return { service, api, contentRef, visible }
}
