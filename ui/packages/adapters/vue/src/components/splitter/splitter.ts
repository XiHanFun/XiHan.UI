import type { Direction, Orientation } from '@xihan-ui/core'
import type { SplitterApi, SplitterPanelProps, SplitterPanelState, SplitterSchema } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h } from 'vue'
import { provideSplitter, useSplitterContext } from './context'
import { useSplitter } from './use-splitter'

type SplitterProps = SplitterSchema['props']

/** 默认插槽的载荷：各面板的百分比与逐块状态、拖拽态，以及整份赋值、单块调整、折叠展开的命令。 */
export interface SplitterRootSlotProps {
  size: number[]
  panels: SplitterPanelState[]
  dragging: boolean
  setSizes: SplitterApi['setSizes']
  setPanelSize: SplitterApi['setPanelSize']
  collapsePanel: SplitterApi['collapsePanel']
  expandPanel: SplitterApi['expandPanel']
  togglePanel: SplitterApi['togglePanel']
}

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
    sizes: { type: Array as PropType<number[]>, default: undefined },
    defaultSizes: { type: Array as PropType<number[]>, default: undefined },
    panels: { type: Array as PropType<SplitterPanelProps[]>, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    disabled: Boolean,
    step: { type: Number, default: undefined },
    largeStep: { type: Number, default: undefined },
  },
  // sizes-change 携带 { sizes }，update:sizes 携带裸数组；sizes-change-end 只在操作收尾时发一次
  emits: {
    'sizes-change': (_details: PayloadOf<SplitterProps, 'onSizesChange'>) => true,
    'update:sizes': (_sizes: PayloadOf<SplitterProps, 'onSizesChange'>['sizes']) => true,
    'sizes-change-end': (_details: PayloadOf<SplitterProps, 'onSizesChangeEnd'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: SplitterRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: SplitterProps['onSizesChange'] = (details) => {
      emit('sizes-change', details)
      emit('update:sizes', details.sizes)
    }
    const notifyEnd: SplitterProps['onSizesChangeEnd'] = (details) => {
      emit('sizes-change-end', details)
    }
    const ctx = useSplitter(props as SplitterProps, notify, notifyEnd)
    provideSplitter(ctx)
    // 容器节点交给机器，矩形在拖拽开始时现量
    return () => h('div', {
      ...ctx.api.value.getRootProps() as Record<string, unknown>,
      ref: ctx.rootRef,
    }, slots.default?.({
      size: ctx.api.value.sizes,
      panels: ctx.api.value.panels,
      dragging: ctx.api.value.dragging,
      setSizes: ctx.api.value.setSizes,
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
