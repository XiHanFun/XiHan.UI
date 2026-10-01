/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tree select 相关实现。

import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type { CollectionVirtualizer, TreeSelectApi, TreeSelectNode, TreeSelectNodeProps, TreeSelectSchema, TreeSelectTagMeta } from '@xihan-ui/headless'
import type { PropType, Ref, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import type { TreeSelectContext } from './use-tree-select'
import { computed, defineComponent, h, mergeProps, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { XhPortal } from '../../runtime/portal'
import { slotIsPlainText } from '../../runtime/slot-content'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { withHandlers } from '../../runtime/with-handlers'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { provideTreeSelect, provideTreeSelectContent, provideTreeSelectNode, provideTreeSelectTag, useTreeSelectContentContext, useTreeSelectContext, useTreeSelectNodeContext, useTreeSelectTagContext } from './context'
import { useTreeSelect } from './use-tree-select'

type TreeSelectProps = TreeSelectSchema['props']

/** 默认插槽的载荷：展开与选中状态、可见行序列、搜索视图、多选的可见标签与折起的个数、节点状态判定与写值方法。 */
export type TreeSelectRootSlotProps = Pick<
  TreeSelectApi,
  | 'open'
  | 'searching'
  | 'inputValue'
  | 'value'
  | 'expandedValue'
  | 'visibleNodes'
  | 'focusedValue'
  | 'empty'
  | 'loading'
  | 'displayText'
  | 'canClear'
  | 'tags'
  | 'overflowCount'
  | 'overflowText'
  | 'isSelected'
  | 'isIndeterminate'
  | 'isExpanded'
  | 'branchLoadState'
  | 'setOpen'
  | 'setValue'
  | 'setExpandedValue'
  | 'setInputValue'
  | 'expand'
  | 'collapse'
  | 'retryBranch'
  | 'select'
  | 'clear'
  | 'deselect'
>

/** 本节点持有焦点时，value 变更重新报告焦点节点，卸载时上报焦点丢失 */
function reportNodeFocus(ctx: TreeSelectContext, el: Ref<HTMLElement | null>, value: () => string): void {
  let registered: string | null = null
  watch(value, (next, prev) => {
    if (next === prev)
      return
    const { service } = ctx
    if (service.getStatus() !== 'Started')
      return
    if (el.value && service.scope.getActiveElement() === el.value)
      service.send({ type: 'NODE.FOCUS', value: next })
    if (registered !== null) {
      service.send({ type: 'NODE.UNMOUNT', value: prev })
      service.send({ type: 'NODE.MOUNT', value: next })
      registered = next
    }
  })
  onMounted(() => queueMicrotask(() => {
    if (ctx.service.getStatus() !== 'Started')
      return
    registered = value()
    ctx.service.send({ type: 'NODE.MOUNT', value: registered })
  }))
  onBeforeUnmount(() => {
    const { service } = ctx
    // 整组一起卸载时根部件先停机，此刻送事件会在 dev 下抛
    if (service.getStatus() !== 'Started')
      return
    if (registered !== null)
      service.send({ type: 'NODE.UNMOUNT', value: registered })
    // 按「本节点当下正持有焦点」判定，不按 value 比对
    if (el.value && service.scope.getActiveElement() === el.value)
      service.send({ type: 'NODE.LOST' })
  })
}

export const XhTreeSelectRoot = defineComponent({
  name: 'XhTreeSelectRoot',
  // 有 connect 兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    collection: { type: Array as PropType<TreeSelectNode[]> },
    /** 完整 collection 与 Virtualizer 的焦点桥；count 必须等于当前 visibleNodes.length。 */
    virtualizer: { type: Object as PropType<CollectionVirtualizer> },
    loadChildren: { type: Function as PropType<TreeSelectProps['loadChildren']> },
    /** 标题文字。提供后不必再写 label 部件；需要放置其他内容时改用 label 插槽。 */
    label: { type: String },
    /** 自动渲染树中是否带清空按钮；手写部件不使用它，写了节点即可清空。 */
    clearable: Boolean,
    value: { type: [String, Array] as PropType<string | string[]> },
    defaultValue: { type: [String, Array] as PropType<string | string[]> },
    expandedValue: { type: Array as PropType<string[]> },
    defaultExpandedValue: { type: Array as PropType<string[]> },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    multiple: Boolean,
    /** 多选标签最多显示的数量，其余折进 +N；默认 3。 */
    maxTagCount: { type: Number },
    /** 浮层内搜索：展开时焦点先落在搜索框上，输入即把树裁到只剩命中的那几枝。 */
    searchable: Boolean,
    /** 自定义匹配规则；缺省为标签大小写不敏感包含。 */
    filter: { type: Function as PropType<TreeSelectProps['filter']> },
    cascade: Boolean,
    checkedStrategy: { type: String as PropType<TreeSelectProps['checkedStrategy']> },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    loading: Boolean,
    variant: { type: String as PropType<ControlVariant> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    placeholder: { type: String },
    translations: { type: Object as PropType<TreeSelectProps['translations']> },
    placement: { type: String as PropType<Placement> },
    offset: { type: Number },
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction> },
    name: { type: String },
    form: { type: String },
  },
  // *-change 携带 details 对象，update:* 携带裸值；选中值恒为数组，单选时长度 ≤ 1
  emits: {
    'clear': () => true,
    'value-change': (_details: PayloadOf<TreeSelectProps, 'onValueChange'>) => true,
    'expanded-value-change': (_details: PayloadOf<TreeSelectProps, 'onExpandedValueChange'>) => true,
    'open-change': (_details: PayloadOf<TreeSelectProps, 'onOpenChange'>) => true,
    'branch-load-start': (_details: PayloadOf<TreeSelectProps, 'onBranchLoadStart'>) => true,
    'branch-load': (_details: PayloadOf<TreeSelectProps, 'onBranchLoad'>) => true,
    'branch-load-error': (_details: PayloadOf<TreeSelectProps, 'onBranchLoadError'>) => true,
    'update:value': (_value: PayloadOf<TreeSelectProps, 'onValueChange'>['value']) => true,
    'update:expandedValue': (_value: PayloadOf<TreeSelectProps, 'onExpandedValueChange'>['value']) => true,
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
    const notifyExpanded: TreeSelectProps['onExpandedValueChange'] = (details) => {
      emit('expanded-value-change', details)
      emit('update:expandedValue', details.value)
    }
    const notifyOpen: TreeSelectProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const notifyBranchLoadStart: TreeSelectProps['onBranchLoadStart'] = details => emit('branch-load-start', details)
    const notifyBranchLoad: TreeSelectProps['onBranchLoad'] = details => emit('branch-load', details)
    const notifyBranchLoadError: TreeSelectProps['onBranchLoadError'] = details => emit('branch-load-error', details)
    const ctx = useTreeSelect(withHandlers(withXhConfig('tree-select', useFormControlProps(props)), { onClear: () => emit('clear') }) as TreeSelectProps, {
      onValueChange: notifyValue,
      onExpandedValueChange: notifyExpanded,
      onOpenChange: notifyOpen,
      onBranchLoadStart: notifyBranchLoadStart,
      onBranchLoad: notifyBranchLoad,
      onBranchLoadError: notifyBranchLoadError,
    })
    provideTreeSelect(ctx)

    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default
      ? slots.default({
          open: ctx.api.value.open,
          searching: ctx.api.value.searching,
          inputValue: ctx.api.value.inputValue,
          value: ctx.api.value.value,
          expandedValue: ctx.api.value.expandedValue,
          visibleNodes: ctx.api.value.visibleNodes,
          focusedValue: ctx.api.value.focusedValue,
          empty: ctx.api.value.empty,
          loading: ctx.api.value.loading,
          displayText: ctx.api.value.displayText,
          canClear: ctx.api.value.canClear,
          tags: ctx.api.value.tags,
          overflowCount: ctx.api.value.overflowCount,
          overflowText: ctx.api.value.overflowText,
          isSelected: ctx.api.value.isSelected,
          isIndeterminate: ctx.api.value.isIndeterminate,
          isExpanded: ctx.api.value.isExpanded,
          branchLoadState: ctx.api.value.branchLoadState,
          setOpen: ctx.api.value.setOpen,
          setValue: ctx.api.value.setValue,
          setExpandedValue: ctx.api.value.setExpandedValue,
          setInputValue: ctx.api.value.setInputValue,
          expand: ctx.api.value.expand,
          collapse: ctx.api.value.collapse,
          retryBranch: ctx.api.value.retryBranch,
          select: ctx.api.value.select,
          clear: ctx.api.value.clear,
          deselect: ctx.api.value.deselect,
        })
      : props.collection
        ? renderDefaultTree(
            ctx.api.value.collection,
            props.multiple ? ctx.api.value.tags : null,
            props.searchable,
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
    return () => h('div', {
      ...ctx.api.value.getControlProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.controlRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhTreeSelectTrigger = defineComponent({
  name: 'XhTreeSelectTrigger',
  setup(_, { slots }) {
    // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
    const fieldWiring = useFieldStateWiring()
    // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
    const fieldLabel = useFieldLabelWiring()
    const ctx = useTreeSelectContext()
    return () => h('button', fieldLabel.value({
      ...fieldWiring.value,
      ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
    }), slots.default?.())
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

export const XhTreeSelectTagList = defineComponent({
  name: 'XhTreeSelectTagList',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    // 标签行：可见标签与 +N 那一枚在里面并排；无选中时连接层给 hidden，value-text 回来显示占位文字
    return () => h('span', ctx.api.value.getTagListProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 标签文字所在的块（tag 的 label）：截断规则挂在这一层。 */
export const XhTreeSelectTagLabel = defineComponent({
  name: 'XhTreeSelectTagLabel',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    return () => h('span', ctx.api.value.getTagLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 标签内容：只有文字时替它包一层 label：截断规则挂在 label 上，直接展开在 root 上的文字过长会把
 * 删除按钮挤出；作者自己写了节点则原样放行。与 XhTagRoot 同一规则。
 * 库自身填入的文字（+N，没有折叠时是空串）恒包 label，三个适配器渲染出同一棵树。
 */
function tagChildren(content: VNode[] | string | undefined): VNode[] | string | undefined {
  if (typeof content === 'string')
    return [h(XhTreeSelectTagLabel, null, () => content)]
  return slotIsPlainText(content) ? [h(XhTreeSelectTagLabel, null, () => content)] : content
}

/** 一个选中值一个标签，即库内 tag 的 root（data-scope="tag"）：语气、尺寸与禁用从树选择传下，形态按控件的面派生；触发器内纯展示，触发器外配合 XhTreeSelectItemDeleteTrigger 可删除。 */
export const XhTreeSelectTag = defineComponent({
  name: 'XhTreeSelectTag',
  props: {
    /** 它代表哪个选中值。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTreeSelectContext()
    provideTreeSelectTag({ value: () => props.value })
    return () => h('span', ctx.api.value.getTagProps({ value: props.value }) as Record<string, unknown>, tagChildren(slots.default?.()))
  },
})

/** 折叠的标签合成的一个标签：同样是 tag 的 root；有插槽时使用插槽，否则显示 +N。没有折叠的标签时连接层写 hidden。 */
export const XhTreeSelectOverflowTag = defineComponent({
  name: 'XhTreeSelectOverflowTag',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    return () => h(
      'span',
      ctx.api.value.getOverflowTagProps() as Record<string, unknown>,
      tagChildren(slots.default?.() ?? ctx.api.value.overflowText),
    )
  },
})

/** 标签中的删除按钮：即所在标签那份 tag 的 close-trigger（data-scope="tag"），可及名使用 translations.deleteItem；点按移除所在标签的选中值。 */
export const XhTreeSelectItemDeleteTrigger = defineComponent({
  name: 'XhTreeSelectItemDeleteTrigger',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    const tag = useTreeSelectTagContext()
    return () => h('button', ctx.api.value.getItemDeleteTriggerProps({ value: tag.value() }) as Record<string, unknown>, slots.default?.())
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
  props: {
    /** 本实例的 Portal 容器；优先于应用级配置。 */
    container: { type: Object as PropType<Element> },
  },
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const ctx = useTreeSelectContext()
    // 树的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner。
    // 两条轴都摆：深层节点靠缩进往行末推，横向溢出与纵向一样是常态。
    // 横条的正负按排版方向算，而组件不读计算样式，把 positioner 上那份显式交过去
    const bars = useScrollbars({
      // 虚拟窗口的滚动层是 Virtualizer 的视口，条子跟着它走
      scrollable: () => ctx.service.prop('virtualizer')?.getViewportElement() ?? ctx.treeRef.value,
      axes: ['vertical', 'horizontal'],
      // 条子走浮层 4px 档
      props: () => ({ dir: (ctx.api.value.getPositionerProps() as { dir?: Direction }).dir, size: 'sm' }),
    })
    // 搬到 portal 落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层
    return () => h(XhPortal, { to: props.container ?? ctx.portalTarget.value, source: ctx.triggerRef }, () => [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps() as Record<string, unknown>, attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, [...(slots.default?.() ?? []), ...bars.render()]),
    ])
  },
})

const XhTreeSelectAutoEmpty = defineComponent({
  name: 'XhTreeSelectAutoEmpty',
  setup() {
    const ctx = useTreeSelectContext()
    const content = useTreeSelectContentContext()
    // 搜索视图里的空是「没有匹配」，与整棵树没有节点分开说
    return () => content.authoredEmptyCount.value > 0
      ? null
      : h('div', {
          ...ctx.api.value.getEmptyProps() as Record<string, unknown>,
          'data-xh-tree-select-auto-empty': '',
        }, ctx.api.value.searching ? ctx.api.value.translations.noMatch : ctx.api.value.translations.empty)
  },
})

const XhTreeSelectAutoLoading = defineComponent({
  name: 'XhTreeSelectAutoLoading',
  setup() {
    const ctx = useTreeSelectContext()
    const content = useTreeSelectContentContext()
    return () => content.authoredLoadingCount.value > 0
      ? null
      : h('div', {
          ...ctx.api.value.getLoadingProps() as Record<string, unknown>,
          'data-xh-tree-select-auto-loading': '',
        }, ctx.api.value.translations.loading)
  },
})

export const XhTreeSelectContent = defineComponent({
  name: 'XhTreeSelectContent',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    const authoredEmptyCount = ref(0)
    const authoredLoadingCount = ref(0)
    const register = (count: Ref<number>): (() => void) => {
      count.value += 1
      let active = true
      return () => {
        if (!active)
          return
        active = false
        count.value -= 1
      }
    }
    provideTreeSelectContent({
      authoredEmptyCount,
      authoredLoadingCount,
      registerEmpty: () => register(authoredEmptyCount),
      registerLoading: () => register(authoredLoadingCount),
    })
    // 收起时只隐藏不卸载
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
      // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
      style: ctx.visible.value ? undefined : { display: 'none' },
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, [slots.default?.(), h(XhTreeSelectAutoEmpty), h(XhTreeSelectAutoLoading)])
  },
})

/** 浮层内搜索框：放在 content 中、tree 之前；没开 searchable 时带 hidden。 */
export const XhTreeSelectInput = defineComponent({
  name: 'XhTreeSelectInput',
  setup() {
    const ctx = useTreeSelectContext()
    return () => h('input', ctx.api.value.getInputProps() as Record<string, unknown>)
  },
})

export const XhTreeSelectTree = defineComponent({
  name: 'XhTreeSelectTree',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    return () => h('div', {
      ...ctx.api.value.getTreeProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.treeRef.value = el as HTMLElement | null },
    }, slots.default?.())
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

/** 条目的第 2 行副文本，跨文字槽、走 muted 档 */
export const XhTreeSelectItemDescription = defineComponent({
  name: 'XhTreeSelectItemDescription',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    const { node } = useTreeSelectNodeContext()
    return () => h('span', ctx.api.value.getItemDescriptionProps(node.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 条目行尾的作者内容（计数、徽标） */
export const XhTreeSelectItemSuffix = defineComponent({
  name: 'XhTreeSelectItemSuffix',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    const { node } = useTreeSelectNodeContext()
    return () => h('span', ctx.api.value.getItemSuffixProps(node.value) as Record<string, unknown>, slots.default?.())
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

function renderBranchFeedback(ctx: TreeSelectContext, node: TreeSelectNodeProps): VNode[] {
  if (ctx.api.value.branchLoadState(node.value) == null)
    return []
  return [
    h('div', ctx.api.value.getBranchLoadingProps(node) as Record<string, unknown>, ctx.api.value.translations.loading),
    h('div', ctx.api.value.getBranchErrorProps(node) as Record<string, unknown>, ctx.api.value.translations.branchError),
    h('button', ctx.api.value.getBranchRetryTriggerProps(node) as Record<string, unknown>, ctx.api.value.translations.retry),
    h('div', ctx.api.value.getBranchEmptyProps(node) as Record<string, unknown>, ctx.api.value.translations.branchEmpty),
  ]
}

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
      [slots.default?.(), ...renderBranchFeedback(ctx, node.value)],
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

export const XhTreeSelectBranchLoading = defineComponent({
  name: 'XhTreeSelectBranchLoading',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    const { node } = useTreeSelectNodeContext()
    return () => h('div', ctx.api.value.getBranchLoadingProps(node.value) as Record<string, unknown>, slots.default?.() ?? ctx.api.value.translations.loading)
  },
})

export const XhTreeSelectBranchError = defineComponent({
  name: 'XhTreeSelectBranchError',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    const { node } = useTreeSelectNodeContext()
    return () => h('div', ctx.api.value.getBranchErrorProps(node.value) as Record<string, unknown>, slots.default?.() ?? ctx.api.value.translations.branchError)
  },
})

export const XhTreeSelectBranchRetryTrigger = defineComponent({
  name: 'XhTreeSelectBranchRetryTrigger',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    const { node } = useTreeSelectNodeContext()
    return () => h('button', ctx.api.value.getBranchRetryTriggerProps(node.value) as Record<string, unknown>, slots.default?.() ?? ctx.api.value.translations.retry)
  },
})

export const XhTreeSelectBranchEmpty = defineComponent({
  name: 'XhTreeSelectBranchEmpty',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    const { node } = useTreeSelectNodeContext()
    return () => h('div', ctx.api.value.getBranchEmptyProps(node.value) as Record<string, unknown>, slots.default?.() ?? ctx.api.value.translations.branchEmpty)
  },
})

export const XhTreeSelectEmpty = defineComponent({
  name: 'XhTreeSelectEmpty',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    const content = useTreeSelectContentContext()
    const unregister = content.registerEmpty()
    onBeforeUnmount(unregister)
    return () => h('div', ctx.api.value.getEmptyProps() as Record<string, unknown>, slots.default?.() ?? (ctx.api.value.searching ? ctx.api.value.translations.noMatch : ctx.api.value.translations.empty))
  },
})

export const XhTreeSelectLoading = defineComponent({
  name: 'XhTreeSelectLoading',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    const content = useTreeSelectContentContext()
    const unregister = content.registerLoading()
    onBeforeUnmount(unregister)
    return () => h('div', ctx.api.value.getLoadingProps() as Record<string, unknown>, slots.default?.() ?? ctx.api.value.translations.loading)
  },
})

export const XhTreeSelectFooter = defineComponent({
  name: 'XhTreeSelectFooter',
  setup(_, { slots }) {
    const ctx = useTreeSelectContext()
    // 浮层底部的操作区：写在 content 里、tree 的兄弟，
    // 放在这里的按钮既不进 role=tree 的拥有关系，也走不到方向键与连打检索
    return () => h('div', ctx.api.value.getFooterProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTreeSelectHiddenInput = defineComponent({
  name: 'XhTreeSelectHiddenInput',
  inheritAttrs: false,
  setup(_, { attrs }) {
    const ctx = useTreeSelectContext()
    // 表单出口，不写这个部件即不参与表单提交
    return () => ctx.api.value.value.map(value => h('input', {
      ...ctx.api.value.getHiddenInputProps({ value }) as Record<string, unknown>,
      ...attrs,
      key: value,
    }))
  },
})

/** 按 collection 递归铺设节点：带 children 的渲染为 branch，其余渲染为 item。 */
function renderNodes(nodes: readonly TreeSelectNode[]): VNode[] {
  return nodes.map(node => (node.children || node.hasChildren)
    ? h(XhTreeSelectBranch, { key: node.value, value: node.value }, () => [
        h(XhTreeSelectBranchControl, null, () => [
          h(XhTreeSelectBranchTrigger),
          h(XhTreeSelectBranchText, null, () => node.label ?? node.value),
          h(XhTreeSelectItemIndicator),
        ]),
        h(XhTreeSelectBranchContent, null, () => renderNodes(node.children ?? [])),
      ])
    : h(XhTreeSelectItem, { key: node.value, value: node.value }, () => [
        h(XhTreeSelectItemIndicator),
        h(XhTreeSelectItemText, null, () => node.label ?? node.value),
      ]))
}

/**
 * 未写默认插槽时按 collection 铺开的整套结构，作者只提供数据。
 * 与手写部件产出的 DOM 完全一致，需要修改结构时写默认插槽，行为不变。
 */
function renderDefaultTree(
  collection: readonly TreeSelectNode[],
  tags: readonly TreeSelectTagMeta[] | null,
  searchable: boolean,
  label: (VNode | string)[] | null,
  clearable: boolean,
): VNode[] {
  return [
    ...(label ? [h(XhTreeSelectLabel, null, () => label)] : []),
    // 盒里放触发器；清空钮是触发器的兄弟（按钮不能套按钮）
    h(XhTreeSelectControl, null, () => [
      // 多选的已选项在触发器里排成标签：占位文字与标签行同时写着，有选中时标签露面、占位让位；
      // 触发器里的标签只作展示（按钮不能套按钮），摆不下的折进 +N
      h(XhTreeSelectTrigger, null, () => [
        h(XhTreeSelectValueText),
        ...(tags
          ? [h(XhTreeSelectTagList, null, () => [
              ...tags.map(tag => h(XhTreeSelectTag, { key: tag.value, value: tag.value }, () => tag.label)),
              h(XhTreeSelectOverflowTag),
            ])]
          : []),
        h(XhTreeSelectIndicator),
      ]),
      ...(clearable ? [h(XhTreeSelectClearTrigger)] : []),
    ]),
    h(XhTreeSelectPositioner, null, () => [
      // 开了搜索时搜索框排在树之前；collection 此刻已是裁剪后的树
      h(XhTreeSelectContent, null, () => [
        ...(searchable ? [h(XhTreeSelectInput)] : []),
        h(XhTreeSelectTree, null, () => renderNodes(collection)),
      ]),
    ]),
  ]
}
