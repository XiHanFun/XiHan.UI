import type { TruncateApi, TruncateSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { connectTruncate, truncateMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

/** 对外的两个回调。 */
export type TruncateNotifiers = Pick<TruncateSchema['props'], 'onOpenChange' | 'onOverflowChange'>

export interface TruncateContext {
  api: ComputedRef<TruncateApi>
  service: Service<TruncateSchema>
  /** 夹字的那个盒子：溢出与文字都量它。 */
  rootRef: Ref<HTMLElement | null>
}

/** 量测与监听都在机器的效应里跑，DOM 取值口经 refs 交进去。 */
export function useTruncate(
  props: TruncateSchema['props'],
  notify?: TruncateNotifiers,
): TruncateContext {
  const rootRef = ref<HTMLElement | null>(null)
  // 传响应式 props 对象本身而非快照，供机器每次读时重新展开
  const service = useMachine(truncateMachine, () => ({ ...props, ...notify }))

  service.refs.set('getRootEl', () => rootRef.value)

  const api = computed(() => connectTruncate(service, vueNormalize))
  return { api, service, rootRef }
}
