import type { TreeNode, TreeSelectApi, TreeSelectNodeProps, TreeSelectSchema } from '@xihan-ui/headless'
import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, Ref, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import type { TreeSelectContext } from './use-tree-select'
import { computed, defineComponent, h, mergeProps, onBeforeUnmount, ref, Teleport, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { useFieldStateWiring } from '../field/use-field-control'
import { provideTreeSelect, provideTreeSelectNode, useTreeSelectContext, useTreeSelectNodeContext } from './context'
import { useTreeSelect } from './use-tree-select'

type TreeSelectProps = TreeSelectSchema['props']

/** 默认插槽的载荷：展开与选中状态、可见行序列、节点状态判定与写值方法。 */
export type TreeSelectRootSlotProps = Pick<
  TreeSelectApi,
  | 'open'
  | 'value'
  | 'expandedValue'
  | 'visibleNodes'
  | 'focusedValue'
  | 'displayText'
  | 'canClear'
  | 'isSelected'
  | 'isIndeterminate'
  | 'isExpanded'
  | 'setOpen'
  | 'setValue'
  | 'setExpandedValue'
  | 'expand'
  | 'collapse'
  | 'select'
  | 'clear'
>

/** 本节点持有焦点时，value 变更重报焦点节点，卸载时上报焦点丢失 */
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
    // 整组一起卸载时根部件先停机，此刻送事件会在 dev 下抛
    if (service.getStatus() !== 'Started')
      return
    // 按「本节点当下正持有焦点」判定，不按 value 比对
    if (el.value && service.scope.getActiveElement() === el.value)
      service.send({ type: 'NODE.LOST' })
  })
}

export const XhTreeSelectRoot = defineComponent({
  name: 'XhTreeSelectRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    collection: { type: Array as PropType<TreeNode[]>, default: undefined },
    /** 标题文字。给了它就不必再写 label 部件；要放别的内容改用 label 插槽。 */
    label: { type: String, default: undefined },
    /** 自动渲染树里是否带清空按钮；手写部件不看它，写了节点即可清。 */
    clearable: Boolean,
    value: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    defaultValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    expandedValue: { type: Array as PropType<string[]>, default: undefined },
    defaultExpandedValue: { type: Array as PropType<string[]>, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    multiple: Boolean,
    cascade: Boolean,
    checkedStrategy: { type: String as PropType<TreeSelectProps['checkedStrategy']>, default: undefined },
    disabled: Boolean,
    readOnly: Boolean,
    invalid: Boolean,
    variant: { type: String as PropType<ControlVariant>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    placeholder: { type: String, default: undefined },
    translations: { type: Object as PropType<TreeSelectProps['translations']>, default: undefined },
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    name: { type: String, default: undefined },
  },
  // *-change 携带 details 对象，update:* 携带裸值；选中值恒为数组，单选时长度 ≤ 1
  emits: {
    'value-change': (_details: PayloadOf<TreeSelectProps, 'onValueChange'>) => true,
    'expanded-change': (_details: PayloadOf<TreeSelectProps, 'onExpandedChange'>) => true,
    'open-change': (_details: PayloadOf<TreeSelectProps, 'onOpenChange'>) => true,
    'update:value': (_value: PayloadOf<TreeSelectProps, 'onValueChange'>['value']) => true,
    'update:expandedValue': (_value: PayloadOf<TreeSelectProps, 'onExpandedChange'>['value']) => true,
    'update:open': (_open: PayloadOf<TreeSelectProps, 'onOpenChange'>['open']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: TreeSelectRootSlotProps) => VNode[]
    label?: () => VNode[]
  }>,
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
    const ctx = useTreeSelect(withXhConfig('tree-select', props) as TreeSelectProps, {
      onValueChange: notifyValue,
      onExpandedChange: notifyExpanded,
      onOpenChange: notifyOpen,
    })
    provideTreeSelect(ctx)

    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default
      ? slots.default({
          open: ctx.api.value.open,
          value: ctx.api.value.value,
          expandedValue: ctx.api.value.expandedValue,
          visibleNodes: ctx.api.value.visibleNodes,
          focusedValue: ctx.api.value.focusedValue,
          displayText: ctx.api.value.displayText,
          canClear: ctx.api.value.canClear,
          isSelected: ctx.api.value.isSelected,
          isIndeterminate: ctx.api.value.isIndeterminate,
          isExpanded: ctx.api.value.isExpanded,
          setOpen: ctx.api.value.setOpen,
          setValue: ctx.api.value.setValue,
          setExpandedValue: ctx.api.value.setExpandedValue,
          expand: ctx.api.value.expand,
          collapse: ctx.api.value.collapse,
          select: ctx.api.value.select,
          clear: ctx.api.value.clear,
        })
      : props.collection
        ? renderDefaultTree(
            ctx.api.value.collection,
            slots.label?.() ?? (props.label != null ? [props.label] : null),
            props.clearable,
          )
        : [])
  },
})

export const XhTreeSelectLabel = defineComponent({
  name: 'XhTreeSelectLabel',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeSelectControl = defineComponent({
  name: 'XhTreeSelectControl',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    // 描边、底色与聚焦环所在的那一层，触发按钮与尾部动作钮在里面并排
    return () => h('div', ctx.api.value.getControlProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeSelectTrigger = defineComponent({
  name: 'XhTreeSelectTrigger',
  setup(_, { slots }) {
    // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
    const fieldWiring = useFieldStateWiring()
    const ctx = useTreeSelectContext()
    return () => h('button', {
      ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
      ...fieldWiring.value,
    }, slots.default?.())
  },
})

export const XhTreeSelectValueText = defineComponent({
  name: 'XhTreeSelectValueText',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    // 有插槽用插槽，否则显示选中项文本或 placeholder
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
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = useTreeSelectContext()
    // 搬到 portal 落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层
    return () => h(Teleport, { to: ctx.portalTarget.value }, [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps() as Record<string, unknown>, attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, slots.default?.()),
    ])
  },
})

export const XhTreeSelectContent = defineComponent({
  name: 'XhTreeSelectContent',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    // 收起时只隐藏不卸载
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
      // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
      style: ctx.visible.value ? undefined : { display: 'none' },
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
    // 分支自身也是 treeitem，供其子部件读取；子节点各自再 provide 一层
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
    // 收起只加 hidden，不卸载子树节点
    return () => h('div', ctx.api.value.getBranchContentProps(node.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeSelectHiddenInput = defineComponent({
  name: 'XhTreeSelectHiddenInput',
  setup() {
    const ctx = useTreeSelectContext()
    // 表单出口，不写这个部件即不参与表单提交
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})

/** 按 collection 递归铺节点：带 children 的落成 branch，其余落成 item。 */
function renderNodes(nodes: readonly TreeNode[]): VNode[] {
  return nodes.map(node => node.children
    ? h(XhTreeSelectBranch, { key: node.value, value: node.value }, () => [
        h(XhTreeSelectBranchControl, null, () => [
          h(XhTreeSelectBranchTrigger),
          h(XhTreeSelectBranchText, null, () => node.label ?? node.value),
        ]),
        h(XhTreeSelectBranchContent, null, () => renderNodes(node.children!)),
      ])
    : h(XhTreeSelectItem, { key: node.value, value: node.value }, () => [
        h(XhTreeSelectItemIndicator),
        h(XhTreeSelectItemText, null, () => node.label ?? node.value),
      ]))
}

/**
 * 没写默认插槽时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写默认插槽，行为不变。
 */
function renderDefaultTree(
  collection: readonly TreeNode[],
  label: (VNode | string)[] | null,
  clearable: boolean,
): VNode[] {
  return [
    ...(label ? [h(XhTreeSelectLabel, null, () => label)] : []),
    // 盒里放触发器；清空钮是触发器的兄弟（按钮不能套按钮）
    h(XhTreeSelectControl, null, () => [
      h(XhTreeSelectTrigger, null, () => [h(XhTreeSelectValueText), h(XhTreeSelectIndicator)]),
      ...(clearable ? [h(XhTreeSelectClearTrigger)] : []),
    ]),
    h(XhTreeSelectPositioner, null, () => [
      h(XhTreeSelectContent, null, () => h(XhTreeSelectTree, null, () => renderNodes(collection))),
    ]),
  ]
}
