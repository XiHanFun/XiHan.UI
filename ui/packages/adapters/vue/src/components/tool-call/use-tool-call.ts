import type { ToolCallApi, ToolCallProps, ToolCallSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectToolCall, toolCallMachine } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

type MachineProps = ToolCallSchema['props']

export interface ToolCallContext {
  api: ComputedRef<ToolCallApi>
}

// 机器属性与视图属性分开传：视图那一半走 connect 第二参，不经机器名分桶的全局文案
export function useToolCall(machineProps: MachineProps, viewProps: ToolCallProps): ToolCallContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(toolCallMachine, () => ({ ...machineProps }), scope)
  const api = computed(() => connectToolCall(service, viewProps, vueNormalize))
  return { api }
}
