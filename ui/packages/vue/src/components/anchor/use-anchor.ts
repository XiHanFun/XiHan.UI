import type { AnchorApi, AnchorSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
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

/**
 * Anchor 不派生任何 part id（没有 IDREF 要串），因此不建 scope——
 * 机器只需要一个能拿到 document / window 的 Scope，交给 createService 建的那个就够了。
 *
 * getScrollEl 交的是判定线所依附的滚动容器；返回 null 即挂在窗口上。
 */
export function useAnchor(
  props: AnchorSchema['props'],
  onValueChange?: AnchorSchema['props']['onValueChange'],
  getScrollEl: () => HTMLElement | null = () => null,
): AnchorContext {
  const listRef = ref<HTMLElement | null>(null)
  // onValueChange 由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(anchorMachine, () => ({ ...props, onValueChange }))

  // 观察器与量测都在机器的 effect 里跑，DOM 侧的取值口经 refs 交进去
  service.refs.set('getListEl', () => listRef.value)
  service.refs.set('getScrollEl', getScrollEl)

  const api = computed(() => connectAnchor(service, vueNormalize))
  return { api, service, listRef }
}
