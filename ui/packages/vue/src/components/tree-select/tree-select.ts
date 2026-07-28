import type { Direction, Placement } from '@xihan-ui/core'
import type { TreeNode, TreeSelectNodeProps, TreeSelectSchema } from '@xihan-ui/headless'
import type { PropType, Ref } from 'vue'
import type { TreeSelectContext } from './use-tree-select'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { provideTreeSelect, provideTreeSelectNode, useTreeSelectContext, useTreeSelectNodeContext } from './context'
import { useTreeSelect } from './use-tree-select'

type TreeSelectProps = TreeSelectSchema['props']

/**
 * 承载焦点的节点被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一个已消失的值上：
 * 没有节点认领 tabindex=0、方向键也失去起点。卸载前如实上报，机器就地重挑锚点，
 * 且只有自己正持有焦点时才报——否则删掉任一无关节点都会把光标一并清掉。
 *
 * v-for 不带 key 时 Vue 会就地复用节点：被删的是「最后一个组件实例」，
 * 而持有焦点的那个 DOM 节点还在、value 却被改成了别的节点。此时锚点仍指着旧值、
 * 已无人认领，键盘就此失灵。自己正持有焦点且 value 变了，就按新值重报一次。
 */
function reportNodeFocus(ctx: TreeSelectContext, el: Ref<HTMLElement | null>, value: () => string): void {
  watch(value, (next, prev) => {
    if (next === prev)
      return
    const { service } = ctx
    if (service.getStatus() !== 'Started')
      return
    if (el.value && service.scope.getActiveElement() === el.value)
      service.send({ type: 'NODE.FOCUS', value: next })
  })
  onBeforeUnmount(() => {
    const { service } = ctx
    // 整个控件一起卸载时根部件先停机，此刻无焦点可言（送事件还会在 dev 下抛）
    if (service.getStatus() !== 'Started')
      return
    // 判据是「本节点当下正持有焦点」，不是「值对得上」：v-for 就地复用时
    // 被卸载的是末位实例、它的 value 可能恰好等于刚纠正过的锚点，按值判会把好端端的锚点清掉
    if (el.value && service.scope.getActiveElement() === el.value)
      service.send({ type: 'NODE.LOST' })
  })
}

export const XhTreeSelectRoot = defineComponent({
  name: 'XhTreeSelectRoot',
  // 缺省值的唯一事实源在 connect —— 凡是 connect 有兜底的一律 default: undefined
  // （loop 尤其：裸 Boolean 声明会把缺省压成 false，将来改缺省就再也传不进真值）
  props: {
    collection: { type: Array as PropType<TreeNode[]>, default: undefined },
    value: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    defaultValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    expandedValue: { type: Array as PropType<string[]>, default: undefined },
    defaultExpandedValue: { type: Array as PropType<string[]>, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    multiple: Boolean,
    disabled: Boolean,
    readOnly: Boolean,
    invalid: Boolean,
    placeholder: { type: String, default: undefined },
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    name: { type: String, default: undefined },
  },
  // *-change 携带 details 对象；update:* 携带裸值，支持
  // v-model:value / v-model:expandedValue / v-model:open。
  // 回传的选中值恒是数组（单选也是长度 ≤ 1 的数组），形状不随模式变
  emits: [
    'value-change',
    'expanded-change',
    'open-change',
    'update:value',
    'update:expandedValue',
    'update:open',
  ],
  setup(props, { slots, emit }) {
    const notifyValue: TreeSelectProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyExpanded: TreeSelectProps['onExpandedChange'] = (details) => {
      emit('expanded-change', details)
      emit('update:expandedValue', details.value)
    }
    const notifyOpen: TreeSelectProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const ctx = useTreeSelect(props as TreeSelectProps, {
      onValueChange: notifyValue,
      onExpandedChange: notifyExpanded,
      onOpenChange: notifyOpen,
    })
    provideTreeSelect(ctx)

    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      value: ctx.api.value.value,
      expandedValue: ctx.api.value.expandedValue,
      visibleNodes: ctx.api.value.visibleNodes,
      focusedValue: ctx.api.value.focusedValue,
      displayText: ctx.api.value.displayText,
      canClear: ctx.api.value.canClear,
      isSelected: ctx.api.value.isSelected,
      isExpanded: ctx.api.value.isExpanded,
      setOpen: ctx.api.value.setOpen,
      setValue: ctx.api.value.setValue,
      setExpandedValue: ctx.api.value.setExpandedValue,
      expand: ctx.api.value.expand,
      collapse: ctx.api.value.collapse,
      select: ctx.api.value.select,
      clear: ctx.api.value.clear,
    }))
  },
})

export const XhTreeSelectLabel = defineComponent({
  name: 'XhTreeSelectLabel',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeSelectTrigger = defineComponent({
  name: 'XhTreeSelectTrigger',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    return () => h('button', {
      ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhTreeSelectValueText = defineComponent({
  name: 'XhTreeSelectValueText',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    // 作者写了插槽就听作者的，否则显示选中项文本，无选中时显示 placeholder
    return () => h(
      'span',
      ctx.api.value.getValueTextProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.displayText,
    )
  },
})

export const XhTreeSelectIndicator = defineComponent({
  name: 'XhTreeSelectIndicator',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    return () => h('span', ctx.api.value.getIndicatorProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeSelectClearTrigger = defineComponent({
  name: 'XhTreeSelectClearTrigger',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    return () => h('button', ctx.api.value.getClearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeSelectPositioner = defineComponent({
  name: 'XhTreeSelectPositioner',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    return () => h('div', {
      ...ctx.api.value.getPositionerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhTreeSelectContent = defineComponent({
  name: 'XhTreeSelectContent',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    // 收起时留在 DOM 只隐藏，不卸载作者节点
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhTreeSelectTree = defineComponent({
  name: 'XhTreeSelectTree',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    return () => h('div', ctx.api.value.getTreeProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeSelectItem = defineComponent({
  name: 'XhTreeSelectItem',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTreeSelectContext()
    const node = computed<TreeSelectNodeProps>(() => ({ value: props.value }))
    provideTreeSelectNode({ node })
    const el = ref<HTMLElement | null>(null)
    reportNodeFocus(ctx, el, () => props.value)
    return () => h(
      'div',
      { ...ctx.api.value.getItemProps(node.value) as Record<string, unknown>, ref: el },
      slots.default?.(),
    )
  },
})

export const XhTreeSelectItemText = defineComponent({
  name: 'XhTreeSelectItemText',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    const { node } = useTreeSelectNodeContext()
    return () => h('span', ctx.api.value.getItemTextProps(node.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeSelectItemIndicator = defineComponent({
  name: 'XhTreeSelectItemIndicator',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    const { node } = useTreeSelectNodeContext()
    return () => h('span', ctx.api.value.getItemIndicatorProps(node.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeSelectBranch = defineComponent({
  name: 'XhTreeSelectBranch',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTreeSelectContext()
    const node = computed<TreeSelectNodeProps>(() => ({ value: props.value }))
    // 分支自己也是 treeitem：它的子部件（control/trigger/text/indicator/content）
    // 认这一份声明，而长在 branch-content 里的子节点会各自再 provide 一层，互不串味
    provideTreeSelectNode({ node })
    const el = ref<HTMLElement | null>(null)
    reportNodeFocus(ctx, el, () => props.value)
    return () => h(
      'div',
      { ...ctx.api.value.getBranchProps(node.value) as Record<string, unknown>, ref: el },
      slots.default?.(),
    )
  },
})

export const XhTreeSelectBranchControl = defineComponent({
  name: 'XhTreeSelectBranchControl',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    const { node } = useTreeSelectNodeContext()
    return () => h('div', ctx.api.value.getBranchControlProps(node.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeSelectBranchTrigger = defineComponent({
  name: 'XhTreeSelectBranchTrigger',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    const { node } = useTreeSelectNodeContext()
    return () => h('span', ctx.api.value.getBranchTriggerProps(node.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeSelectBranchIndicator = defineComponent({
  name: 'XhTreeSelectBranchIndicator',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    const { node } = useTreeSelectNodeContext()
    return () => h('span', ctx.api.value.getBranchIndicatorProps(node.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeSelectBranchText = defineComponent({
  name: 'XhTreeSelectBranchText',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    const { node } = useTreeSelectNodeContext()
    return () => h('span', ctx.api.value.getBranchTextProps(node.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeSelectBranchContent = defineComponent({
  name: 'XhTreeSelectBranchContent',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    const { node } = useTreeSelectNodeContext()
    // 收起只加 hidden，不卸载作者节点：子树里的业务 DOM 与滚动位置都得留着
    return () => h('div', ctx.api.value.getBranchContentProps(node.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeSelectHiddenInput = defineComponent({
  name: 'XhTreeSelectHiddenInput',
  setup() {
    const ctx = useTreeSelectContext()
    // 表单出口，作者显式写进标记里；不写这个部件就是不参与表单提交
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})
