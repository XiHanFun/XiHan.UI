import type {
  TransferCheckState,
  TransferFilter,
  TransferItem,
  TransferItemProps,
  TransferPanelProps,
  TransferSchema,
  TransferSide,
} from '@xihan-ui/headless'
import type { Direction } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import {
  provideTransfer,
  provideTransferItem,
  provideTransferPanel,
  useTransferContext,
  useTransferItemContext,
  useTransferPanelContext,
} from './context'
import { useTransfer } from './use-transfer'

type TransferProps = TransferSchema['props']

/** 默认插槽的载荷：目标侧的值与两侧的勾选、两侧当下可见的条目，以及勾选、写值与搬运的动作。 */
export interface TransferRootSlotProps {
  value: string[]
  selected: string[]
  sourceItems: readonly TransferItem[]
  targetItems: readonly TransferItem[]
  canMove: (to: TransferSide) => boolean
  checkState: (side: TransferSide) => TransferCheckState
  isChecked: (value: string) => boolean
  setValue: (next: string[]) => void
  setSelected: (next: string[]) => void
  toggle: (value: string) => void
  toggleAll: (side: TransferSide) => void
  move: (to: TransferSide) => void
}

/** 面板默认插槽的载荷：这一侧的身份、当下可见的条目、这一侧的全选三态与搜索词。 */
export interface TransferPanelSlotProps {
  side: TransferSide
  items: readonly TransferItem[]
  checkState: TransferCheckState
  query: string
}

/** 源/目标两个面板部件共用的插槽集合。 */
interface TransferPanelSlots {
  default?: (props: TransferPanelSlotProps) => VNode[]
}

export const XhTransferRoot = defineComponent({
  name: 'XhTransferRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    collection: { type: Array as PropType<TransferItem[]>, default: undefined },
    value: { type: Array as PropType<string[]>, default: undefined },
    defaultValue: { type: Array as PropType<string[]>, default: undefined },
    selected: { type: Array as PropType<string[]>, default: undefined },
    defaultSelected: { type: Array as PropType<string[]>, default: undefined },
    searchable: Boolean,
    filter: { type: Function as PropType<TransferFilter>, default: undefined },
    disabled: Boolean,
    oneWay: Boolean,
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
  },
  // *-change 携带 details 对象，update:* 携带裸集合以支持 v-model
  emits: {
    'value-change': (_details: PayloadOf<TransferProps, 'onValueChange'>) => true,
    'selection-change': (_details: PayloadOf<TransferProps, 'onSelectionChange'>) => true,
    'update:value': (_value: PayloadOf<TransferProps, 'onValueChange'>['value']) => true,
    'update:selected': (_selected: PayloadOf<TransferProps, 'onSelectionChange'>['selected']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: TransferRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notifyValue: TransferProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifySelected: TransferProps['onSelectionChange'] = (details) => {
      emit('selection-change', details)
      emit('update:selected', details.selected)
    }
    const ctx = useTransfer(props as TransferProps, {
      onValueChange: notifyValue,
      onSelectionChange: notifySelected,
    })
    provideTransfer(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      value: ctx.api.value.value,
      selected: ctx.api.value.selected,
      sourceItems: ctx.api.value.visibleItems('source'),
      targetItems: ctx.api.value.visibleItems('target'),
      canMove: ctx.api.value.canMove,
      checkState: ctx.api.value.checkState,
      isChecked: ctx.api.value.isChecked,
      setValue: ctx.api.value.setValue,
      setSelected: ctx.api.value.setSelected,
      toggle: ctx.api.value.toggle,
      toggleAll: ctx.api.value.toggleAll,
      move: ctx.api.value.move,
    }))
  },
})

/** 生成源/目标面板共用的 setup，两侧只在 side 上不同 */
function panelSetup(side: TransferSide): (props: unknown, ctx: { slots: TransferPanelSlots }) => () => VNode {
  return (_: unknown, { slots }: { slots: TransferPanelSlots }) => {
    const ctx = useTransferContext()
    const panel = computed<TransferPanelProps>(() => ({ side }))
    provideTransferPanel({ panel })
    return () => h('div', ctx.api.value.getPanelProps(panel.value) as Record<string, unknown>, slots.default?.({
      side,
      // 这一侧当下看得见的条目（分侧 + 搜索之后），不是数据入口：入口叫 collection，是整份全集
      items: ctx.api.value.visibleItems(side),
      checkState: ctx.api.value.checkState(side),
      query: ctx.api.value.query(side),
    }))
  }
}

export const XhTransferSourcePanel = defineComponent({
  name: 'XhTransferSourcePanel',
  slots: Object as SlotsType<TransferPanelSlots>,
  setup: panelSetup('source'),
})

export const XhTransferTargetPanel = defineComponent({
  name: 'XhTransferTargetPanel',
  slots: Object as SlotsType<TransferPanelSlots>,
  setup: panelSetup('target'),
})

export const XhTransferPanelHeader = defineComponent({
  name: 'XhTransferPanelHeader',
  setup(_, { slots }) {
    const ctx = useTransferContext()
    const { panel } = useTransferPanelContext()
    return () => h('div', ctx.api.value.getPanelHeaderProps(panel.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTransferPanelTitle = defineComponent({
  name: 'XhTransferPanelTitle',
  setup(_, { slots }) {
    const ctx = useTransferContext()
    const { panel } = useTransferPanelContext()
    return () => h('span', ctx.api.value.getPanelTitleProps(panel.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTransferPanelCount = defineComponent({
  name: 'XhTransferPanelCount',
  setup(_, { slots }) {
    const ctx = useTransferContext()
    const { panel } = useTransferPanelContext()
    // 只带 data-checked-count / data-count 属性，文案由作者或皮肤层提供
    return () => h('span', ctx.api.value.getPanelCountProps(panel.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTransferSearch = defineComponent({
  name: 'XhTransferSearch',
  setup() {
    const ctx = useTransferContext()
    const { panel } = useTransferPanelContext()
    return () => h('input', ctx.api.value.getSearchProps(panel.value) as Record<string, unknown>)
  },
})

export const XhTransferList = defineComponent({
  name: 'XhTransferList',
  setup(_, { slots }) {
    const ctx = useTransferContext()
    const { panel } = useTransferPanelContext()
    return () => h('div', ctx.api.value.getListProps(panel.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTransferSelectAllTrigger = defineComponent({
  name: 'XhTransferSelectAllTrigger',
  setup(_, { slots }) {
    const ctx = useTransferContext()
    const { panel } = useTransferPanelContext()
    // 用原生 button，激活与禁用交给平台
    return () => h('button', ctx.api.value.getSelectAllTriggerProps(panel.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTransferItem = defineComponent({
  name: 'XhTransferItem',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTransferContext()
    const { panel } = useTransferPanelContext()
    // 条目只报值与所属面板，禁用与标签回 collection 里查；同一 value 的两侧节点靠 side 分身份
    const item = computed<TransferItemProps>(() => ({ value: props.value, side: panel.value.side }))
    provideTransferItem({ item })
    // 本条目持有焦点时，value 变更重报焦点条目，卸载时上报列表失焦
    const itemEl = ref<HTMLElement | null>(null)
    watch(() => props.value, (next, prev) => {
      if (next === prev)
        return
      const { service } = ctx
      if (service.getStatus() !== 'Started')
        return
      if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
        service.send({ type: 'ITEM.FOCUS', side: panel.value.side, value: next })
    })
    onBeforeUnmount(() => {
      const { service } = ctx
      // 整组一起卸载时根部件先停机，此刻送事件会在 dev 下抛
      if (service.getStatus() !== 'Started')
        return
      // 按「本节点当下正持有焦点」判定，不按 value 比对
      if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
        service.send({ type: 'LIST.BLUR', side: panel.value.side })
    })
    return () => h(
      'div',
      { ...ctx.api.value.getItemProps(item.value) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})

export const XhTransferItemText = defineComponent({
  name: 'XhTransferItemText',
  setup(_, { slots }) {
    const ctx = useTransferContext()
    const { item } = useTransferItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTransferItemCheckbox = defineComponent({
  name: 'XhTransferItemCheckbox',
  setup(_, { slots }) {
    const ctx = useTransferContext()
    const { item } = useTransferItemContext()
    return () => h('span', ctx.api.value.getItemCheckboxProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTransferToTargetTrigger = defineComponent({
  name: 'XhTransferToTargetTrigger',
  setup(_, { slots }) {
    const ctx = useTransferContext()
    // 用原生 button，激活与禁用交给平台
    return () => h('button', ctx.api.value.getToTargetTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTransferToSourceTrigger = defineComponent({
  name: 'XhTransferToSourceTrigger',
  setup(_, { slots }) {
    const ctx = useTransferContext()
    return () => h('button', ctx.api.value.getToSourceTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})
