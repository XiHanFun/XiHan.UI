import type { EllipsisApi, EllipsisSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { connectEllipsis, ellipsisMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

/** 对外的两个回调。 */
export type EllipsisNotifiers = Pick<EllipsisSchema['props'], 'onExpandedChange' | 'onOverflowChange'>

export interface EllipsisContext {
  api: ComputedRef<EllipsisApi>
  service: Service<EllipsisSchema>
  /** 夹字的那个盒子：溢出与文字都量它。 */
  rootRef: Ref<HTMLElement | null>
}

/** 量测与监听都在机器的效应里跑，DOM 取值口经 refs 交进去。 */
export function useEllipsis(
  props: EllipsisSchema['props'],
  notify?: EllipsisNotifiers,
): EllipsisContext {
  const rootRef = ref<HTMLElement | null>(null)
  // 传响应式 props 对象本身而非快照，供机器每次读时重新展开
  const service = useMachine(ellipsisMachine, () => ({ ...props, ...notify }))

  service.refs.set('getRootEl', () => rootRef.value)

  const api = computed(() => connectEllipsis(service, vueNormalize))
  return { api, service, rootRef }
}
