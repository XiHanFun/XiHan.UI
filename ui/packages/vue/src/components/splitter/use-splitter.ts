import type { SplitterApi, SplitterSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectSplitter, splitterMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface SplitterContext {
  api: ComputedRef<SplitterApi>
  service: Service<SplitterSchema>
  /** 容器节点。机器在拖拽开始那一刻拿它量矩形，connect 一律不碰 DOM。 */
  rootRef: Ref<HTMLElement | null>
}

export function useSplitter(
  props: SplitterSchema['props'],
  onSizeChange?: SplitterSchema['props']['onSizeChange'],
  onSizeChangeEnd?: SplitterSchema['props']['onSizeChangeEnd'],
): SplitterContext {
  const rootRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // 两个回调由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(splitterMachine, () => ({ ...props, onSizeChange, onSizeChangeEnd }), scope)

  // 懒读而不是把节点直接塞进去：ref 在挂载后才有值，机器建起来的那一刻还是 null
  service.refs.set('getRootEl', () => rootRef.value)

  const api = computed(() => connectSplitter(service, vueNormalize))
  return { api, service, rootRef }
}
