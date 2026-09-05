import type { Service } from '@xihan-ui/core'
import type { AnchorApi, AnchorSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { anchorMachine, connectAnchor } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface AnchorContext {
  api: ComputedRef<AnchorApi>
  service: Service<AnchorSchema>
  /** list 节点：链接集合的查询容器，同时是指示条量测的参照系。 */
  listRef: Ref<HTMLElement | null>
}

/** Anchor 不派生 part id，故不另建 scope；getScrollEl 返回判定线所依附的滚动容器，null 即挂在窗口上。 */
export function useAnchor(
  props: AnchorSchema['props'],
  onValueChange?: AnchorSchema['props']['onValueChange'],
  getScrollEl: () => HTMLElement | null = () => null,
): AnchorContext {
  const listRef = ref<HTMLElement | null>(null)
  const service = useMachine(anchorMachine, () => ({ ...props, onValueChange }))

  // 观察器与量测都在机器的 effect 里跑，DOM 侧的取值口经 refs 交进去
  service.refs.set('getListEl', () => listRef.value)
  service.refs.set('getScrollEl', getScrollEl)

  const api = computed(() => connectAnchor(service, vueNormalize))
  return { api, service, listRef }
}
