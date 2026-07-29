import type { Direction, Orientation } from '@xihan-ui/core'
import type { SplitterPanelProps, SplitterSchema } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { computed, defineComponent, h } from 'vue'
import { provideSplitter, useSplitterContext } from './context'
import { useSplitter } from './use-splitter'

type SplitterProps = SplitterSchema['props']

/** 部件上的下标声明，兼收字符串以支持 DOM 属性写法。 */
const INDEX_PROP = { index: { type: [Number, String] as PropType<number | string>, default: 0 } }

function toIndex(raw: number | string): number {
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

export const XhSplitterRoot = defineComponent({
  name: 'XhSplitterRoot',
  props: {
    // 布局恒是数组；default: undefined 表示非受控
    size: { type: Array as PropType<number[]>, default: undefined },
    defaultSize: { type: Array as PropType<number[]>, default: undefined },
    panels: { type: Array as PropType<SplitterPanelProps[]>, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    disabled: Boolean,
    step: { type: Number, default: undefined },
    largeStep: { type: Number, default: undefined },
  },
  // size-change 携带 { size }，update:size 携带裸数组；size-change-end 只在操作收尾时发一次
  emits: ['size-change', 'update:size', 'size-change-end'],
  setup(props, { slots, emit }) {
    const notify: SplitterProps['onSizeChange'] = (details) => {
      emit('size-change', details)
      emit('update:size', details.size)
    }
    const notifyEnd: SplitterProps['onSizeChangeEnd'] = (details) => {
      emit('size-change-end', details)
    }
    const ctx = useSplitter(props as SplitterProps, notify, notifyEnd)
    provideSplitter(ctx)
    // 容器节点交给机器，矩形在拖拽开始时现量
    return () => h('div', {
      ...ctx.api.value.getRootProps() as Record<string, unknown>,
      ref: ctx.rootRef,
    }, slots.default?.({
      size: ctx.api.value.size,
      panels: ctx.api.value.panels,
      dragging: ctx.api.value.dragging,
      setSize: ctx.api.value.setSize,
      setPanelSize: ctx.api.value.setPanelSize,
      collapsePanel: ctx.api.value.collapsePanel,
      expandPanel: ctx.api.value.expandPanel,
      togglePanel: ctx.api.value.togglePanel,
    }))
  },
})

export const XhSplitterPanel = defineComponent({
  name: 'XhSplitterPanel',
  props: {
    /** 第几块面板；多块时必须逐个写明（`:index="i"`）。 */
    ...INDEX_PROP,
  },
  setup(props, { slots }) {
    const ctx = useSplitterContext()
    const index = computed(() => toIndex(props.index))
    return () => h('div', ctx.api.value.getPanelProps(index.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhSplitterResizeTrigger = defineComponent({
  name: 'XhSplitterResizeTrigger',
  props: {
    /** 第几条分隔条；它坐在第 index 与第 index+1 块面板之间，调整的是前一块。 */
    ...INDEX_PROP,
  },
  setup(props, { slots }) {
    const ctx = useSplitterContext()
    const index = computed(() => toIndex(props.index))
    return () => h('div', ctx.api.value.getResizeTriggerProps(index.value) as Record<string, unknown>, slots.default?.())
  },
})
