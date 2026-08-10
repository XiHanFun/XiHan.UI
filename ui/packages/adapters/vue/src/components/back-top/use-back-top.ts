import type { BackTopApi, BackTopSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef } from 'vue'
import { backTopMachine, connectBackTop } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface BackTopContext {
  api: ComputedRef<BackTopApi>
  service: Service<BackTopSchema>
}

/** getTargetEl 返回滚动容器，null 即整页滚动；滚动量的观察在机器的效应里跑。 */
export function useBackTop(
  props: BackTopSchema['props'],
  onVisibleChange?: BackTopSchema['props']['onVisibleChange'],
  getTargetEl: () => HTMLElement | null = () => null,
): BackTopContext {
  const service = useMachine(backTopMachine, () => ({ ...props, onVisibleChange }))

  service.refs.set('getTargetEl', getTargetEl)

  const api = computed(() => connectBackTop(service, vueNormalize))
  return { api, service }
}
