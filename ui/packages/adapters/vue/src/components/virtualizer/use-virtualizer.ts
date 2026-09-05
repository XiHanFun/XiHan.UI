import type { Service } from '@xihan-ui/core'
import type { VirtualizerApi, VirtualizerSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectVirtualizer, virtualizerMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface VirtualizerContext {
  service: Service<VirtualizerSchema>
  api: ComputedRef<VirtualizerApi>
  /** 真正 overflow:auto 的那层：内核的尺寸观察与滚动监听都挂在它身上。 */
  viewportRef: Ref<HTMLElement | null>
  /** 撑出总长的那层，条目的定位上下文。 */
  contentRef: Ref<HTMLElement | null>
}

export function useVirtualizer(
  props: VirtualizerSchema['props'],
  onChange?: VirtualizerSchema['props']['onChange'],
): VirtualizerContext {
  const viewportRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // onChange 由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器；props 在 getter 内展开以跟随运行期变更
  const service = useMachine(virtualizerMachine, () => ({ ...props, onChange }), scope)

  // 传 getter 而非节点，ref 在挂载后才有值；内核建立、尺寸观察与滚动监听都在机器的效应里进行
  service.refs.set('getViewportEl', () => viewportRef.value)
  service.refs.set('getContentEl', () => contentRef.value)

  const api = computed(() => connectVirtualizer(service, vueNormalize))
  return { service, api, viewportRef, contentRef }
}
