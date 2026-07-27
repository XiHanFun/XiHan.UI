import type { RatingApi, RatingSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectRating, ratingMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface RatingContext {
  api: ComputedRef<RatingApi>
  /** 部件要上报 DOM 侧的事实（如条目卸载带走了焦点），得直接够到机器。 */
  service: Service<RatingSchema>
}

export function useRating(
  props: RatingSchema['props'],
  callbacks: Pick<RatingSchema['props'], 'onValueChange' | 'onHoverChange'> = {},
): RatingContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // 两个回调由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(ratingMachine, () => ({ ...props, ...callbacks }), scope)
  const api = computed(() => connectRating(service, vueNormalize))
  return { api, service }
}
