import type { LayoutApi, LayoutSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectLayout, layoutMachine } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface LayoutContext {
  api: ComputedRef<LayoutApi>
}

export function useLayout(
  props: LayoutSchema['props'],
  onSiderCollapsedChange?: LayoutSchema['props']['onSiderCollapsedChange'],
): LayoutContext {
  // 把手要用 aria-controls 指向侧栏，两者的 id 必须同源，所以显式建 scope
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(layoutMachine, () => ({ ...props, onSiderCollapsedChange }), scope)
  const api = computed(() => connectLayout(service, vueNormalize))
  return { api }
}
