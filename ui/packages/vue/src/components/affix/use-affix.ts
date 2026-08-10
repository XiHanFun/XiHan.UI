import type { AffixApi, AffixSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { affixMachine, connectAffix } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface AffixContext {
  api: ComputedRef<AffixApi>
  service: Service<AffixSchema>
  /** 占位盒节点：判定线与占位尺寸都量它。 */
  rootRef: Ref<HTMLElement | null>
}

/** getTargetEl 返回滚动容器，null 即整页滚动；量测与监听都在机器的效应里跑，DOM 取值口经 refs 交进去。 */
export function useAffix(
  props: AffixSchema['props'],
  onAffixChange?: AffixSchema['props']['onAffixChange'],
  getTargetEl: () => HTMLElement | null = () => null,
): AffixContext {
  const rootRef = ref<HTMLElement | null>(null)
  const service = useMachine(affixMachine, () => ({ ...props, onAffixChange }))

  service.refs.set('getRootEl', () => rootRef.value)
  service.refs.set('getTargetEl', getTargetEl)

  const api = computed(() => connectAffix(service, vueNormalize))
  return { api, service, rootRef }
}
