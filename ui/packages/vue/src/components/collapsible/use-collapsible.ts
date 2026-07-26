import type { CollapsibleApi, CollapsibleSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { collapsibleMachine, connectCollapsible } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface CollapsibleContext {
  api: ComputedRef<CollapsibleApi>
}

export function useCollapsible(
  props: CollapsibleSchema['props'],
  onOpenChange?: CollapsibleSchema['props']['onOpenChange'],
): CollapsibleContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // onOpenChange 由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(collapsibleMachine, () => ({ ...props, onOpenChange }), scope)
  const api = computed(() => connectCollapsible(service, vueNormalize))
  return { api }
}
