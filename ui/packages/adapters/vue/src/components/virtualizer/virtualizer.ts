import type { VirtualizerApi, VirtualizerChangeDetails, VirtualizerSchema } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h, onMounted, onUpdated, ref } from 'vue'
import { provideVirtualizer, useVirtualizerContext } from './context'
import { useVirtualizer } from './use-virtualizer'

type VirtualizerProps = VirtualizerSchema['props']

/** 默认插槽的载荷：此刻该渲染的条目与总长、可视区首末下标与滚动态，以及滚动与量尺寸的动作。 */
export type VirtualizerRootSlotProps = Pick<
  VirtualizerApi,
  | 'virtualItems'
  | 'totalSize'
  | 'startIndex'
  | 'endIndex'
  | 'scrolling'
  | 'lanes'
  | 'scrollToIndex'
  | 'measureElement'
  | 'measure'
>

export const XhVirtualizerRoot = defineComponent({
  name: 'XhVirtualizerRoot',
  // 有机器与 connect 兜底的 prop 一律 default: undefined
  props: {
    count: { type: Number, default: undefined },
    estimateSize: { type: [Number, Function] as PropType<number | ((index: number) => number)>, default: undefined },
    overscan: { type: Number, default: undefined },
    horizontal: { type: Boolean, default: undefined },
    gap: { type: Number, default: undefined },
    getItemKey: { type: Function as PropType<(index: number) => string | number>, default: undefined },
    scrollMargin: { type: Number, default: undefined },
    paddingStart: { type: Number, default: undefined },
    paddingEnd: { type: Number, default: undefined },
    lanes: { type: Number, default: undefined },
  },
  // change 携带当前该渲染哪些条目的详情
  emits: {
    change: (_details: PayloadOf<VirtualizerProps, 'onChange'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: VirtualizerRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: VirtualizerProps['onChange'] = (details: VirtualizerChangeDetails) => emit('change', details)
    const ctx = useVirtualizer(props as VirtualizerProps, notify)
    provideVirtualizer(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      virtualItems: ctx.api.value.virtualItems,
      totalSize: ctx.api.value.totalSize,
      startIndex: ctx.api.value.startIndex,
      endIndex: ctx.api.value.endIndex,
      scrolling: ctx.api.value.scrolling,
      lanes: ctx.api.value.lanes,
      scrollToIndex: ctx.api.value.scrollToIndex,
      measureElement: ctx.api.value.measureElement,
      measure: ctx.api.value.measure,
    }))
  },
})

export const XhVirtualizerViewport = defineComponent({
  name: 'XhVirtualizerViewport',
  setup(_, { slots }) {
    const ctx = useVirtualizerContext()
    // 视口节点经 ref 交给机器，由内核在效应里接上
    return () => h('div', {
      ...ctx.api.value.getViewportProps() as Record<string, unknown>,
      ref: ctx.viewportRef,
    }, slots.default?.())
  },
})

export const XhVirtualizerContent = defineComponent({
  name: 'XhVirtualizerContent',
  setup(_, { slots }) {
    const ctx = useVirtualizerContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      ref: ctx.contentRef,
    }, slots.default?.())
  },
})

export const XhVirtualizerItem = defineComponent({
  name: 'XhVirtualizerItem',
  props: {
    /** 这个节点是第几条。 */
    value: { type: [Number, String] as PropType<number | string>, required: true },
    /** 是否把真实尺寸回喂给内核；不开时条目尺寸按 estimateSize 算。 */
    measure: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useVirtualizerContext()
    const el = ref<HTMLElement | null>(null)

    // 在挂载与更新后量尺寸，此时节点已落进 DOM
    const report = (): void => {
      if (props.measure)
        ctx.api.value.measureElement(el.value)
    }
    onMounted(report)
    onUpdated(report)

    return () => h('div', {
      ...ctx.api.value.getItemProps({ index: Number(props.value) }) as Record<string, unknown>,
      ref: el,
    }, slots.default?.())
  },
})
