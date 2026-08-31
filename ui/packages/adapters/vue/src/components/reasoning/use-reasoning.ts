import type { ReasoningApi, ReasoningProps, ToolCallSchema } from '@xihan-ui/headless'
import type { RuntimeConfig } from '@xihan-ui/kernel'
import type { ComputedRef, Ref } from 'vue'
import { connectReasoning, toolCallMachine } from '@xihan-ui/headless'
import { createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { createVueIdGenerator } from '../../runtime/vue-id'

type MachineProps = ToolCallSchema['props']

export interface ReasoningContext {
  api: ComputedRef<ReasoningApi>
  contentRef: Ref<HTMLElement | null>
  /** 收起动画播完之前保持为真：真正的收起由它落成内联 display。 */
  visible: Ref<boolean>
}

// 自动开合整套复用 tool-call 的机器：它不认解剖，只认在不在跑与四个叶态
export function useReasoning(machineProps: MachineProps, viewProps: ReasoningProps): ReasoningContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(toolCallMachine, () => ({ ...machineProps }), scope)
  const api = computed(() => connectReasoning(service, viewProps, vueNormalize))
  const contentRef = ref<HTMLElement | null>(null)

  // 服务端没有 DOM、也就没有退场：config 传 null 时闸门退化成「跟着展开态」
  let config: RuntimeConfig | null = null
  if (typeof document !== 'undefined')
    config = createRuntimeConfig({ scope, idGenerator: idGen })

  const visible = useOverlayExit({ config, isOpen: () => api.value.open, contentRef })
  return { api, contentRef, visible }
}
