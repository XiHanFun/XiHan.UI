/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 listbox 相关实现。

import type { Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { ListboxApi, ListboxGroupProps, ListboxItemProps, ListboxNode, ListboxNodeMeta, ListboxSchema, ListboxSelectionMode } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h, mergeProps, onBeforeUnmount, onUpdated, ref, watch } from 'vue'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { useFormControlProps } from '../form/use-form-control'
import {
  provideListbox,
  provideListboxItem,
  provideListboxItemGroup,
  useListboxContext,
  useListboxItemContext,
  useListboxItemGroupContext,
} from './context'
import { useListbox } from './use-listbox'

type ListboxProps = ListboxSchema['props']

/** 默认插槽的载荷：选中集合、选择模式与焦点锚点，以及判定选中与整份赋值、单选、切换的命令。 */
export type ListboxRootSlotProps = Pick<
  ListboxApi,
  'value' | 'selectionMode' | 'focusedValue' | 'isSelected' | 'setValue' | 'select' | 'toggle'
>

export const XhListboxRoot = defineComponent({
  name: 'XhListboxRoot',
  // 有 connect 兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    collection: { type: Array as PropType<ListboxNode[]> },
    /** 标题文字。提供后不必再写 label 部件；需要放置其他内容时改用 label 插槽。 */
    label: { type: String },
    value: { type: [String, Array] as PropType<string | string[]> },
    defaultValue: { type: [String, Array] as PropType<string | string[]> },
    selectionMode: { type: String as PropType<ListboxSelectionMode> },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    loading: Boolean,
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    loop: { type: Boolean, default: undefined },
    typeahead: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction> },
    orientation: { type: String as PropType<Orientation> },
  },
  // value-change 携带 { value }，update:value 携带裸集合；回传值恒为数组，单选时长度 ≤ 1
  emits: {
    'value-change': (_details: PayloadOf<ListboxProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<ListboxProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: ListboxRootSlotProps) => VNode[]
    label?: () => VNode[]
    item?: (node: ListboxNodeMeta) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: ListboxProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useListbox(useFormControlProps(props) as ListboxProps, notify)
    provideListbox(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, [
      ...(slots.default
        ? slots.default({
          value: ctx.api.value.value,
          selectionMode: ctx.api.value.selectionMode,
          focusedValue: ctx.api.value.focusedValue,
          isSelected: ctx.api.value.isSelected,
          setValue: ctx.api.value.setValue,
          select: ctx.api.value.select,
          toggle: ctx.api.value.toggle,
        }) ?? []
        : props.collection
          ? renderDefaultTree(
              ctx.api.value.collection,
              slots.label?.() ?? (props.label != null ? [props.label] : null),
              slots.item,
            )
          : []),
    ])
  },
})

export const XhListboxLabel = defineComponent({
  name: 'XhListboxLabel',
  setup(_, { slots }) {
    const ctx = useListboxContext()
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhListboxContent = defineComponent({
  name: 'XhListboxContent',
  // 根是片段（列表节点 + 贴层的条子），Vue 不会把直通属性合上去：作者写的 class、style 与 data-* 自己接住落到列表节点上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = useListboxContext()
    const contentRef = ref<HTMLElement | null>(null)
    // 定高小列表走自绘条（§6.6）：条子是 content 的兄弟、挂在 root 这个定位盒上，贴在 content 自己的盒子上
    // （root 里还有标题与占位，贴壳边会盖到它们）；两条轴都摆——皮肤给的是两轴 overflow: auto。
    // 页内宿主走 6px 缺省档；横条的正负按排版方向算，把机器里那份 dir 交过去
    const bars = useScrollbars({
      scrollable: () => contentRef.value,
      axes: ['vertical', 'horizontal'],
      anchor: 'layer',
      props: () => ({ dir: ctx.service.prop('dir') }),
    })
    // 条目增减、占位显隐都会挪动列表在壳内的位置与尺寸：每次更新后重量一次偏移盒
    onUpdated(() => bars.measure())
    return () => [
      h('div', {
        ...mergeProps(ctx.api.value.getContentProps() as Record<string, unknown>, attrs),
        ref: (el: unknown) => { contentRef.value = el as HTMLElement | null },
      }, slots.default?.()),
      ...bars.render(),
    ]
  },
})

export const XhListboxEmpty = defineComponent({
  name: 'XhListboxEmpty',
  setup(_, { slots }) {
    const ctx = useListboxContext()
    // 空态占位：写在 root 里、content 的兄弟，不进列表框的拥有关系。
    // 给了 collection 时收放归连接层，条目手写时归作者
    return () => h('div', ctx.api.value.getEmptyProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhListboxLoading = defineComponent({
  name: 'XhListboxLoading',
  setup(_, { slots }) {
    const ctx = useListboxContext()
    // 在途占位：与空态占位同一个位置，取数期间顶上来
    return () => h('div', ctx.api.value.getLoadingProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhListboxLoadMoreTrigger = defineComponent({
  name: 'XhListboxLoadMoreTrigger',
  setup(_, { slots }) {
    const ctx = useListboxContext()
    // 取下一页的入口：点了做什么归作者，这里只把在途与禁用两档焊成点不动
    return () => h('button', ctx.api.value.getLoadMoreTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhListboxGroup = defineComponent({
  name: 'XhListboxGroup',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useListboxContext()
    const group = computed<ListboxGroupProps>(() => ({ value: props.value }))
    provideListboxItemGroup({ group })
    return () => h('div', ctx.api.value.getGroupProps(group.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhListboxGroupLabel = defineComponent({
  name: 'XhListboxGroupLabel',
  setup(_, { slots }) {
    const ctx = useListboxContext()
    const { group } = useListboxItemGroupContext()
    return () => h('span', ctx.api.value.getGroupLabelProps(group.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhListboxItem = defineComponent({
  name: 'XhListboxItem',
  props: {
    value: { type: String, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useListboxContext()
    const item = computed<ListboxItemProps>(() => ({ value: props.value, disabled: props.disabled }))
    provideListboxItem({ item })
    // 本条目持有焦点时，value 变更重报焦点条目，卸载时上报列表失焦
    const itemEl = ref<HTMLElement | null>(null)
    watch(() => props.value, (next, prev) => {
      if (next === prev)
        return
      const { service } = ctx
      if (service.getStatus() !== 'Started')
        return
      if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
        service.send({ type: 'ITEM.FOCUS', value: next })
    })
    onBeforeUnmount(() => {
      const { service } = ctx
      if (service.getStatus() !== 'Started')
        return
      // 按「本节点当下正持有焦点」判定，不按 value 比对
      if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
        service.send({ type: 'LIST.BLUR' })
    })
    return () => h(
      'div',
      { ...ctx.api.value.getItemProps(item.value) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})

export const XhListboxItemText = defineComponent({
  name: 'XhListboxItemText',
  setup(_, { slots }) {
    const ctx = useListboxContext()
    const { item } = useListboxItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 条目的第 2 行副文本，跨文字槽、走 muted 档 */
export const XhListboxItemDescription = defineComponent({
  name: 'XhListboxItemDescription',
  setup(_, { slots }) {
    const ctx = useListboxContext()
    const { item } = useListboxItemContext()
    return () => h('span', ctx.api.value.getItemDescriptionProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhListboxItemIndicator = defineComponent({
  name: 'XhListboxItemIndicator',
  setup(_, { slots }) {
    const ctx = useListboxContext()
    const { item } = useListboxItemContext()
    return () => h('span', ctx.api.value.getItemIndicatorProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 未写默认插槽时按 collection 铺开的整套结构，作者只提供数据。
 * 与手写部件产出的 DOM 完全一致，需要修改结构（分组、条目外的节点）时写默认插槽。
 */
function renderDefaultTree(
  collection: readonly ListboxNodeMeta[],
  label: (VNode | string)[] | null,
  itemSlot?: (node: ListboxNodeMeta) => VNode[],
): VNode[] {
  return [
    ...(label ? [h(XhListboxLabel, null, () => label)] : []),
    h(XhListboxContent, null, () => collection.map(node =>
      h(XhListboxItem, { key: node.value, value: node.value }, () => [
        h(XhListboxItemText, null, () => itemSlot?.(node) ?? node.label),
        ...(node.description != null ? [h(XhListboxItemDescription, null, () => node.description)] : []),
        h(XhListboxItemIndicator),
      ]),
    )),
  ]
}
