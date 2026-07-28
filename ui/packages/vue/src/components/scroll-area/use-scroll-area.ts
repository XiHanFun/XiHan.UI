import type { Orientation } from '@xihan-ui/core'
import type { ScrollAreaApi, ScrollAreaSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectScrollArea, scrollAreaMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface ScrollAreaContext {
  service: Service<ScrollAreaSchema>
  api: ComputedRef<ScrollAreaApi>
  /** 真正 overflow:auto 的那层：尺寸、滚动量与 scroll 事件都取自它。 */
  viewportRef: Ref<HTMLElement | null>
  /** 内容包裹层：只用于跟随尺寸变化。 */
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

  // 懒读而不是把节点直接塞进去：ref 在挂载后才有值，机器建起来的那一刻还是 null。
  // 量尺寸与挂 scroll 监听全在机器的效应里进行，连接层一行 DOM 都不碰
  service.refs.set('getViewportEl', () => viewportRef.value)
  service.refs.set('getContentEl', () => contentRef.value)
  service.refs.set('getScrollbarEl', (axis: Orientation) => scrollbarRefs[axis].value)

  const api = computed(() => connectScrollArea(service, vueNormalize))
  return { service, api, viewportRef, contentRef, scrollbarRefs }
}
