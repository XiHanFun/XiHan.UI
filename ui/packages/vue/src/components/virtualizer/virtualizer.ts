import type { VirtualizerChangeDetails, VirtualizerSchema } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h, onMounted, onUpdated, ref } from 'vue'
import { provideVirtualizer, useVirtualizerContext } from './context'
import { useVirtualizer } from './use-virtualizer'

type VirtualizerProps = VirtualizerSchema['props']

export const XhVirtualizerRoot = defineComponent({
  name: 'XhVirtualizerRoot',
  // 缺省值的唯一事实源在机器与 connect —— 凡是那边有兜底的一律 default: undefined
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
  // change 携带该渲什么的完整详情：作者据此渲条目节点，组件不替作者生成节点
  emits: ['change'],
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
    // 视口节点交给机器：内核在效应里接上它，连接期一律不碰 DOM
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
    /**
     * 这个节点是第几条。身份声明叫 value 而不是 index：与本仓其余集合类部件同名，
     * WC 侧也只观察 value 这一个作者属性——列表滚动时节点是被复用的（同一个节点改写
     * 自己的下标），改名会让这类原地改写在 WC 上静默不生效。
     */
    value: { type: [Number, String] as PropType<number | string>, required: true },
    /**
     * 把自己的真实尺寸回喂给内核（动态高度用）。
     * 不开时条目尺寸一律按 estimateSize 算。
     */
    measure: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useVirtualizerContext()
    const el = ref<HTMLElement | null>(null)

    // 量尺寸必须等节点真的落进 DOM：渲染期读到的是上一帧（甚至还没有节点）。
    // 收起来的条目要不要量由 connect 判（两侧同一份规则）；
    // 尺寸没变时内核不会再通知，因此这条回路会自己停下来，不会来回震荡
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
