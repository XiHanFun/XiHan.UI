import type { InfiniteScrollApi, InfiniteScrollSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { connectInfiniteScroll, infiniteScrollMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface InfiniteScrollContext {
  api: ComputedRef<InfiniteScrollApi>
  service: Service<InfiniteScrollSchema>
  /** 哨兵节点：观察器盯的就是它。 */
  sentinelRef: Ref<HTMLElement | null>
}

/** 观察在机器的效应里跑，两处 DOM 取值口经 refs 交进去；getTargetEl 返回滚动容器，null 即整页滚动。 */
export function useInfiniteScroll(
  props: InfiniteScrollSchema['props'],
  onLoad?: InfiniteScrollSchema['props']['onLoad'],
  getTargetEl: () => HTMLElement | null = () => null,
): InfiniteScrollContext {
  const sentinelRef = ref<HTMLElement | null>(null)
  const service = useMachine(infiniteScrollMachine, () => ({ ...props, onLoad }))

  service.refs.set('getSentinelEl', () => sentinelRef.value)
  service.refs.set('getTargetEl', getTargetEl)

  const api = computed(() => connectInfiniteScroll(service, vueNormalize))
  return { api, service, sentinelRef }
}
