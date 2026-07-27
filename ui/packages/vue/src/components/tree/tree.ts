import type { Direction } from '@xihan-ui/core'
import type { TreeNode, TreeNodeProps, TreeSchema, TreeSelectionMode } from '@xihan-ui/headless'
import type { PropType, Ref } from 'vue'
import type { TreeContext } from './use-tree'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { provideTree, provideTreeNode, useTreeContext, useTreeNodeContext } from './context'
import { useTree } from './use-tree'

type TreeProps = TreeSchema['props']

/**
 * 承载焦点的节点被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一个已消失的值上：
 * 容器判自己"焦点在树内"退出 Tab 序列，又没有节点认领得了这个锚点，
 * 整棵树零个 Tab 停靠点，键盘用户再也进不来。卸载前把焦点离场如实上报，
 * 且只有自己正持有焦点时才报——否则删掉任一无关节点都会把光标一并清掉。
 *
 * v-for 不带 key 时 Vue 会就地复用节点：被删的是"最后一个组件实例"，
 * 而持有焦点的那个 DOM 节点还在、value 却被改成了别的节点。此时锚点仍指着旧值、
 * 已无人认领，键盘就此失灵。自己正持有焦点且 value 变了，就按新值重报一次。
 */
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
    // 整棵树一起卸载时根部件先停机，此刻无焦点可言（送事件还会在 dev 下抛）
    if (service.getStatus() !== 'Started')
      return
    // 判据是「本节点当下正持有焦点」，不是「值对得上」：v-for 就地复用时
    // 被卸载的是末位实例、它的 value 可能恰好等于刚纠正过的锚点，按值判会把好端端的锚点清掉
    if (el.value && service.scope.getActiveElement() === el.value)
      service.send({ type: 'TREE.BLUR' })
  })
}

export const XhTreeRoot = defineComponent({
  name: 'XhTreeRoot',
  // 缺省值的唯一事实源在 connect —— 凡是 connect 有兜底的一律 default: undefined
  // （expandOnClick 与 typeahead 尤其：裸 Boolean 声明会把缺省压成 false，
  // 点行展开与连打检索就默默关掉了）
  props: {
    collection: { type: Array as PropType<TreeNode[]>, default: undefined },
    expandedValue: { type: Array as PropType<string[]>, default: undefined },
    defaultExpandedValue: { type: Array as PropType<string[]>, default: undefined },
    selectedValue: { type: Array as PropType<string[]>, default: undefined },
    defaultSelectedValue: { type: Array as PropType<string[]>, default: undefined },
    selectionMode: { type: String as PropType<TreeSelectionMode>, default: undefined },
    expandOnClick: { type: Boolean, default: undefined },
    disabled: Boolean,
    loop: { type: Boolean, default: undefined },
    typeahead: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
  },
  // expanded-change / selection-change 携带 { value }；update:* 携带裸集合，支持 v-model。
  // 回传的恒是数组（单选也是长度 ≤ 1 的数组），形状不随模式变
  emits: ['expanded-change', 'update:expandedValue', 'selection-change', 'update:selectedValue'],
  setup(props, { slots, emit }) {
    const onExpandedChange: TreeProps['onExpandedChange'] = (details) => {
      emit('expanded-change', details)
      emit('update:expandedValue', details.value)
    }
    const onSelectionChange: TreeProps['onSelectionChange'] = (details) => {
      emit('selection-change', details)
      emit('update:selectedValue', details.value)
    }
    const ctx = useTree(props as TreeProps, onExpandedChange, onSelectionChange)
    provideTree(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      visibleNodes: ctx.api.value.visibleNodes,
      expandedValue: ctx.api.value.expandedValue,
      selectedValue: ctx.api.value.selectedValue,
      focusedValue: ctx.api.value.focusedValue,
      isExpanded: ctx.api.value.isExpanded,
      isSelected: ctx.api.value.isSelected,
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
    // 分支自己也是 treeitem：它的子部件（control/trigger/text/indicator/content）
    // 认这一份声明，而长在 branch-content 里的子节点会各自再 provide 一层，互不串味
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
    // 收起只加 hidden，不卸载作者节点：子树里的业务 DOM 与滚动位置都得留着
    return () => h('div', ctx.api.value.getBranchContentProps(node.value) as Record<string, unknown>, slots.default?.())
  },
})
