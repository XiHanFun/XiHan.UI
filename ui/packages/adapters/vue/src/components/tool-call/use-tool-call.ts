import type { RuntimeConfig } from '@xihan-ui/core'
import type { ToolCallApi, ToolCallProps, ToolCallSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectToolCall, toolCallMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { createVueIdGenerator } from '../../runtime/vue-id'

type MachineProps = ToolCallSchema['props']

export interface ToolCallContext {
  api: ComputedRef<ToolCallApi>
  contentRef: Ref<HTMLElement | null>
  /** 收起动画播完之前保持为真：真正的收起由它落成内联 display。 */
  visible: Ref<boolean>
}

// 机器属性与视图属性分开传：视图那一半走 connect 第二参，不经机器名分桶的全局文案
export function useToolCall(machineProps: MachineProps, viewProps: ToolCallProps): ToolCallContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(toolCallMachine, () => ({ ...machineProps }), scope)
  const api = computed(() => connectToolCall(service, viewProps, vueNormalize))
  const contentRef = ref<HTMLElement | null>(null)

  // 服务端没有 DOM、也就没有退场：config 传 null 时闸门退化成「跟着展开态」
  let config: RuntimeConfig | null = null
  if (typeof document !== 'undefined')
    config = createRuntimeConfig({ scope, idGenerator: idGen })

  const visible = useOverlayExit({ config, isOpen: () => api.value.open, contentRef })
  return { api, contentRef, visible }
}
