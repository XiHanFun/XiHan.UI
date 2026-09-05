import type { InfiniteScrollApi, InfiniteScrollSchema } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import { defineComponent, h } from 'vue'
import { provideInfiniteScroll, useInfiniteScrollContext } from './context'
import { useInfiniteScroll } from './use-infinite-scroll'

type InfiniteScrollProps = InfiniteScrollSchema['props']

/** 默认插槽的载荷：取数所处的阶段，以及正在取数与已关掉两个状态。 */
export type InfiniteScrollRootSlotProps = Pick<InfiniteScrollApi, 'phase' | 'loading' | 'disabled'>

/** 根节点是列表的外壳，状态挂在它身上；滚动本身走浏览器原生通路，组件不接管。 */
export const XhInfiniteScrollRoot = defineComponent({
  name: 'XhInfiniteScrollRoot',
  // 缺省值由机器与 connect 决定，这里一律 default: undefined
  props: {
    distance: { type: Number, default: undefined },
    disabled: { type: Boolean, default: undefined },
    loading: { type: Boolean, default: undefined },
    /** 裁剪出可视区的滚动容器，缺省即整页滚动；distance 的提前量扩的正是这块区域。 */
    target: { type: Object as PropType<HTMLElement | null>, default: undefined },
  },
  emits: {
    load: () => true,
  },
  slots: Object as SlotsType<{
    default?: (props: InfiniteScrollRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: InfiniteScrollProps['onLoad'] = () => emit('load')
    // 传响应式 props 对象本身而非快照，供机器每次读时重新展开
    const ctx = useInfiniteScroll(props as InfiniteScrollProps, notify, () => props.target ?? null)
    provideInfiniteScroll(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      phase: ctx.api.value.phase,
      loading: ctx.api.value.loading,
      disabled: ctx.api.value.disabled,
    }))
  },
})

/**
 * 取下一页的按钮：与哨兵是同一条通路的两个入口。
 * 读屏在虚拟光标模式下不产生滚动事件，哨兵那条路够不着，这个按钮是它的键盘等价通路。
 * 文案写在插槽里，组件不代填。
 */
export const XhInfiniteScrollLoadMoreTrigger = defineComponent({
  name: 'XhInfiniteScrollLoadMoreTrigger',
  setup(_, { slots }) {
    const ctx = useInfiniteScrollContext()
    return () => h(
      'button',
      ctx.api.value.getLoadMoreTriggerProps() as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

/** 摆在列表末尾的哨兵，进可视区即报"该取下一页了"。 */
export const XhInfiniteScrollSentinel = defineComponent({
  name: 'XhInfiniteScrollSentinel',
  setup(_, { slots }) {
    const ctx = useInfiniteScrollContext()
    return () => h('div', {
      ...ctx.api.value.getSentinelProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.sentinelRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})
