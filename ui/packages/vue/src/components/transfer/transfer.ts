import type { Direction } from '@xihan-ui/core'
import type {
  TransferFilter,
  TransferItem,
  TransferItemProps,
  TransferPanelProps,
  TransferSchema,
  TransferSide,
} from '@xihan-ui/headless'
import type { PropType, Slots, VNode } from 'vue'
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

export const XhTransferRoot = defineComponent({
  name: 'XhTransferRoot',
  // 缺省值的唯一事实源在 connect —— 凡是 connect 有兜底的一律 default: undefined
  // （loop 尤其：裸 Boolean 声明会把缺省压成 false，方向键回绕就默默关掉了）
  props: {
    items: { type: Array as PropType<TransferItem[]>, default: undefined },
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
  // *-change 携带 details 对象；update:* 携带裸集合，支持 v-model:value / v-model:selected
  emits: ['value-change', 'selected-change', 'update:value', 'update:selected'],
  setup(props, { slots, emit }) {
    const notifyValue: TransferProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifySelected: TransferProps['onSelectedChange'] = (details) => {
      emit('selected-change', details)
      emit('update:selected', details.selected)
    }
    const ctx = useTransfer(props as TransferProps, {
      onValueChange: notifyValue,
      onSelectedChange: notifySelected,
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

/**
 * 面板 setup 的共用体：两侧只在 side 上不同，结构与插槽完全一样。
 * 组件本身仍逐个声明（Vue 的组件名要是字面量，工厂产出的类型也难看），
 * 但"面板做什么"只写这一份。
 */
function panelSetup(side: TransferSide): (props: unknown, ctx: { slots: Slots }) => () => VNode {
  return (_: unknown, { slots }: { slots: Slots }) => {
    const ctx = useTransferContext()
    const panel = computed<TransferPanelProps>(() => ({ side }))
    provideTransferPanel({ panel })
    return () => h('div', ctx.api.value.getPanelProps(panel.value) as Record<string, unknown>, slots.default?.({
      side,
      items: ctx.api.value.visibleItems(side),
      checkState: ctx.api.value.checkState(side),
      query: ctx.api.value.query(side),
    }))
  }
}

export const XhTransferSourcePanel = defineComponent({
  name: 'XhTransferSourcePanel',
  setup: panelSetup('source'),
})

export const XhTransferTargetPanel = defineComponent({
  name: 'XhTransferTargetPanel',
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
    // 计数节点只带数字属性，文案由作者写（语言与量词都是他的事）；
    // 留空时皮肤层会用 ::after 把 data-checked-count / data-count 补出来
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
    // 必须是原生 <button>：三态格的 Enter/Space 激活由平台负责，禁用也只有原生 disabled 拦得住
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
    // 禁用与标签一律回 items 里查，条目自己只报值与所属面板：
    // 两侧各挂一份全集，同一个 value 的两个节点靠 side 分身份
    const item = computed<TransferItemProps>(() => ({ value: props.value, side: panel.value.side }))
    provideTransferItem({ item })
    // 承载焦点的条目被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一个已消失的值上：
    // 列表容器判自己"焦点在组内"退出 Tab 序列，又没有条目认领得了这个锚点，
    // 这一侧零个 Tab 停靠点，键盘用户再也进不来。卸载前把焦点离场如实上报，
    // 且只有自己正持有焦点时才报——否则删掉任一无关条目都会把光标一并清掉。
    // v-for 不带 key 时 Vue 会就地复用节点：被删的是"最后一个组件实例"，
    // 而持有焦点的那个 DOM 节点还在、value 却被改成了别的条目。此时锚点仍指着旧值、
    // 已无人认领，键盘就此失灵。自己正持有焦点且 value 变了，就按新值重报一次。
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
      // 整个组件一起卸载时根部件先停机，此刻无焦点可言（送事件还会在 dev 下抛）
      if (service.getStatus() !== 'Started')
        return
      // 判据是「本节点当下正持有焦点」，不是「值对得上」：v-for 就地复用时
      // 被卸载的是末位实例、它的 value 可能恰好等于刚纠正过的锚点，按值判会把好端端的锚点清掉
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
    // 必须是原生 <button>：Enter/Space 的激活由平台负责，禁用态也只有原生 disabled
    // 才能真的把它移出 Tab 序列
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
