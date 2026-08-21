import type { ScrollbarApi, ScrollbarSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { connectScrollbar, scrollbarMachine } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed, ref, toValue } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

/** 作者交出滚动容器的两条路：直接给节点（或取节点的函数），或者给它的 id。 */
export type ScrollbarTarget = HTMLElement | (() => HTMLElement | null) | null | undefined

export interface ScrollbarContext {
  service: Service<ScrollbarSchema>
  api: ComputedRef<ScrollbarApi>
  /** 根节点，指针进出它也算「手还在这儿」。 */
  rootRef: Ref<HTMLElement | null>
  /** 轨道节点，长度在拖动/点击那一刻现量。 */
  trackRef: Ref<HTMLElement | null>
}

type ScrollbarProps = ScrollbarSchema['props']

/** 作者给的 props 连同滚动容器；`scrollable` 不进机器，由这里解析成节点交给 refs。 */
export type ScrollbarSource = ScrollbarProps & { scrollable?: ScrollbarTarget }

export function useScrollbar(
  source: MaybeRefOrGetter<ScrollbarSource>,
  callbacks: Pick<ScrollbarProps, 'onScrollStart' | 'onScrollEnd' | 'onDragStart' | 'onDragEnd'> = {},
): ScrollbarContext {
  const rootRef = ref<HTMLElement | null>(null)
  const trackRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // 每次取值现读 props：挂载后改 type / disabled 机器要跟着变
  const service = useMachine(scrollbarMachine, () => {
    const { scrollable: _scrollable, ...rest } = toValue(source)
    return { ...rest, ...callbacks }
  }, scope)

  /**
   * 先认作者给的节点，没有再按 controls 当 id 去查。
   * 每次调用现查：作者的容器可能是条件渲染出来的，缓存住会永远指向第一帧那个（或 null）。
   */
  const resolveScrollable = (): HTMLElement | null => {
    const { scrollable: given, controls: id } = toValue(source)
    if (typeof given === 'function')
      return given()
    if (given)
      return given
    if (!id || typeof document === 'undefined')
      return null
    const found = document.getElementById(id)
    return found instanceof HTMLElement ? found : null
  }

  // 传 getter 而非节点，ref 在挂载后才有值；量尺寸与挂监听都在机器的效应里进行
  service.refs.set('getScrollableEl', resolveScrollable)
  service.refs.set('getTrackEl', () => trackRef.value)
  service.refs.set('getRootEl', () => rootRef.value)

  const api = computed(() => connectScrollbar(service, vueNormalize))
  return { service, api, rootRef, trackRef }
}
