import type { TreeApi, TreeNode, TreeNodeProps, TreeSchema, TreeSelectionMode } from '@xihan-ui/headless'
import type { Direction } from '@xihan-ui/kernel'
import type { PropType, Ref, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import type { TreeContext } from './use-tree'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { provideTree, provideTreeNode, useTreeContext, useTreeNodeContext } from './context'
import { useTree } from './use-tree'

type TreeProps = TreeSchema['props']

/** 默认插槽的载荷：可见行序列与展开、选中、焦点状态，以及按值判定与展开、收起、选中的动作。 */
export type TreeRootSlotProps = Pick<
  TreeApi,
  | 'visibleNodes'
  | 'expandedValue'
  | 'selection'
  | 'focusedValue'
  | 'isExpanded'
  | 'isSelected'
  | 'isIndeterminate'
  | 'expand'
  | 'collapse'
  | 'select'
>

/** 本节点持有焦点时，value 变更重报焦点节点，卸载时上报整树失焦 */
function reportNodeFocus(ctx: TreeContext, el: Ref<HTMLElement | null>, value: () => string): void {
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
    // 整组一起卸载时根部件先停机，此刻送事件会在 dev 下抛
    if (service.getStatus() !== 'Started')
      return
    // 按「本节点当下正持有焦点」判定，不按 value 比对
    if (el.value && service.scope.getActiveElement() === el.value)
      service.send({ type: 'TREE.BLUR' })
  })
}

export const XhTreeRoot = defineComponent({
  name: 'XhTreeRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    collection: { type: Array as PropType<TreeNode[]>, default: undefined },
    expandedValue: { type: Array as PropType<string[]>, default: undefined },
    defaultExpandedValue: { type: Array as PropType<string[]>, default: undefined },
    selection: { type: Array as PropType<string[]>, default: undefined },
    defaultSelection: { type: Array as PropType<string[]>, default: undefined },
    multiple: { type: Boolean, default: undefined },
    /** 子层排布方向，默认 vertical。给函数即逐层判定：分支答自己那层子节点怎么排。 */
    orientation: { type: [String, Function] as PropType<TreeProps['orientation']>, default: undefined },
    selectionMode: { type: String as PropType<TreeSelectionMode>, default: undefined },
    cascade: Boolean,
    checkedStrategy: { type: String as PropType<TreeProps['checkedStrategy']>, default: undefined },
    expandOnClick: { type: Boolean, default: undefined },
    disabled: Boolean,
    loop: { type: Boolean, default: undefined },
    typeahead: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
  },
  // *-change 携带 { value }，update:* 携带裸集合；回传值恒为数组，单选时长度 ≤ 1
  emits: {
    'expanded-change': (_details: PayloadOf<TreeProps, 'onExpandedChange'>) => true,
    'update:expandedValue': (_value: PayloadOf<TreeProps, 'onExpandedChange'>['value']) => true,
    'selection-change': (_details: PayloadOf<TreeProps, 'onSelectionChange'>) => true,
    'update:selection': (_value: PayloadOf<TreeProps, 'onSelectionChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: TreeRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const onExpandedChange: TreeProps['onExpandedChange'] = (details) => {
      emit('expanded-change', details)
      emit('update:expandedValue', details.value)
    }
    const onSelectionChange: TreeProps['onSelectionChange'] = (details) => {
      emit('selection-change', details)
      emit('update:selection', details.value)
    }
    const ctx = useTree(props as TreeProps, onExpandedChange, onSelectionChange)
    provideTree(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      visibleNodes: ctx.api.value.visibleNodes,
      expandedValue: ctx.api.value.expandedValue,
      selection: ctx.api.value.selection,
      focusedValue: ctx.api.value.focusedValue,
      isExpanded: ctx.api.value.isExpanded,
      isSelected: ctx.api.value.isSelected,
      isIndeterminate: ctx.api.value.isIndeterminate,
      expand: ctx.api.value.expand,
      collapse: ctx.api.value.collapse,
      select: ctx.api.value.select,
    }))
  },
})

export const XhTreeLabel = defineComponent({
  name: 'XhTreeLabel',
  setup(_, { slots }) {
    const ctx = useTreeContext()
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeTree = defineComponent({
  name: 'XhTreeTree',
  setup(_, { slots }) {
    const ctx = useTreeContext()
    return () => h('div', ctx.api.value.getTreeProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeItem = defineComponent({
  name: 'XhTreeItem',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTreeContext()
    const node = computed<TreeNodeProps>(() => ({ value: props.value }))
    provideTreeNode({ node })
    const el = ref<HTMLElement | null>(null)
    reportNodeFocus(ctx, el, () => props.value)
    return () => h(
      'div',
      { ...ctx.api.value.getItemProps(node.value) as Record<string, unknown>, ref: el },
      slots.default?.(),
    )
  },
})

export const XhTreeItemText = defineComponent({
  name: 'XhTreeItemText',
  setup(_, { slots }) {
    const ctx = useTreeContext()
    const { node } = useTreeNodeContext()
    return () => h('span', ctx.api.value.getItemTextProps(node.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeItemCheckbox = defineComponent({
  name: 'XhTreeItemCheckbox',
  setup(_, { slots }) {
    const ctx = useTreeContext()
    const { node } = useTreeNodeContext()
    return () => h('span', ctx.api.value.getItemCheckboxProps(node.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeBranchCheckbox = defineComponent({
  name: 'XhTreeBranchCheckbox',
  setup(_, { slots }) {
    const ctx = useTreeContext()
    const { node } = useTreeNodeContext()
    return () => h('span', ctx.api.value.getBranchCheckboxProps(node.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeItemIndicator = defineComponent({
  name: 'XhTreeItemIndicator',
  setup(_, { slots }) {
    const ctx = useTreeContext()
    const { node } = useTreeNodeContext()
    return () => h('span', ctx.api.value.getItemIndicatorProps(node.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeBranch = defineComponent({
  name: 'XhTreeBranch',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTreeContext()
    const node = computed<TreeNodeProps>(() => ({ value: props.value }))
    // 分支自身也是 treeitem，供其子部件读取；子节点各自再 provide 一层
    provideTreeNode({ node })
    const el = ref<HTMLElement | null>(null)
    reportNodeFocus(ctx, el, () => props.value)
    return () => h(
      'div',
      { ...ctx.api.value.getBranchProps(node.value) as Record<string, unknown>, ref: el },
      slots.default?.(),
    )
  },
})

export const XhTreeBranchControl = defineComponent({
  name: 'XhTreeBranchControl',
  setup(_, { slots }) {
    const ctx = useTreeContext()
    const { node } = useTreeNodeContext()
    return () => h('div', ctx.api.value.getBranchControlProps(node.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeBranchTrigger = defineComponent({
  name: 'XhTreeBranchTrigger',
  setup(_, { slots }) {
    const ctx = useTreeContext()
    const { node } = useTreeNodeContext()
    return () => h('span', ctx.api.value.getBranchTriggerProps(node.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeBranchIndicator = defineComponent({
  name: 'XhTreeBranchIndicator',
  setup(_, { slots }) {
    const ctx = useTreeContext()
    const { node } = useTreeNodeContext()
    return () => h('span', ctx.api.value.getBranchIndicatorProps(node.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeBranchText = defineComponent({
  name: 'XhTreeBranchText',
  setup(_, { slots }) {
    const ctx = useTreeContext()
    const { node } = useTreeNodeContext()
    return () => h('span', ctx.api.value.getBranchTextProps(node.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeBranchContent = defineComponent({
  name: 'XhTreeBranchContent',
  setup(_, { slots }) {
    const ctx = useTreeContext()
    const { node } = useTreeNodeContext()
    // 收起只加 hidden，不卸载子树节点
    return () => h('div', ctx.api.value.getBranchContentProps(node.value) as Record<string, unknown>, slots.default?.())
  },
})
