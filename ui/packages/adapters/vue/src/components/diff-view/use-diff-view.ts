import type { DiffViewApi, DiffViewSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectDiffView, diffViewMachine } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

type Props = DiffViewSchema['props']

export interface DiffViewContext {
  api: ComputedRef<DiffViewApi>
}

export function useDiffView(props: Props, onExpandedChange?: Props['onExpandedChange']): DiffViewContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(diffViewMachine, () => ({ ...props, onExpandedChange }), scope)
  const api = computed(() => connectDiffView(service, vueNormalize))
  return { api }
}
