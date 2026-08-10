import type { ScrollAreaApi, ScrollAreaSchema } from '@xihan-ui/headless'
import type { Orientation } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { connectScrollArea, scrollAreaMachine } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface ScrollAreaContext {
  service: Service<ScrollAreaSchema>
  api: ComputedRef<ScrollAreaApi>
  /** overflow:auto 的那层，尺寸、滚动量与 scroll 事件都取自它。 */
  viewportRef: Ref<HTMLElement | null>
  /** 内容包裹层，用于跟随尺寸变化。 */
  contentRef: Ref<HTMLElement | null>
  /** 两条轴各自的滚动条节点，轨道长度按轴现量。 */
  scrollbarRefs: Record<Orientation, Ref<HTMLElement | null>>
}

export function useScrollArea(props: ScrollAreaSchema['props']): ScrollAreaContext {
  const viewportRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)
  const scrollbarRefs: Record<Orientation, Ref<HTMLElement | null>> = {
    vertical: ref<HTMLElement | null>(null),
    horizontal: ref<HTMLElement | null>(null),
  }

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(scrollAreaMachine, () => ({ ...props }), scope)

  // 传 getter 而非节点，ref 在挂载后才有值；量尺寸与挂监听都在机器的效应里进行
  service.refs.set('getViewportEl', () => viewportRef.value)
  service.refs.set('getContentEl', () => contentRef.value)
  service.refs.set('getScrollbarEl', (axis: Orientation) => scrollbarRefs[axis].value)

  const api = computed(() => connectScrollArea(service, vueNormalize))
  return { service, api, viewportRef, contentRef, scrollbarRefs }
}
