import type { SwitchApi, SwitchSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectSwitch, switchMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface SwitchContext {
  api: ComputedRef<SwitchApi>
}

export function useSwitch(
  props: SwitchSchema['props'],
  onCheckedChange?: SwitchSchema['props']['onCheckedChange'],
): SwitchContext {
  const service = useMachine(switchMachine, () => ({ ...props, onCheckedChange }))
  const api = computed(() => connectSwitch(service, vueNormalize))
  return { api }
}
