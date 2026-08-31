import type { ReasoningApi, ReasoningProps, ToolCallSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectReasoning, toolCallMachine } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

type MachineProps = ToolCallSchema['props']

export interface ReasoningContext {
  api: ComputedRef<ReasoningApi>
}

// 自动开合整套复用 tool-call 的机器：它不认解剖，只认在不在跑与四个叶态
export function useReasoning(machineProps: MachineProps, viewProps: ReasoningProps): ReasoningContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(toolCallMachine, () => ({ ...machineProps }), scope)
  const api = computed(() => connectReasoning(service, viewProps, vueNormalize))
  return { api }
}
