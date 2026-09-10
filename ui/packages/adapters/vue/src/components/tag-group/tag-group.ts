import type { Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { TagGroupApi, TagGroupItemProps, TagGroupNode, TagGroupNodeMeta, TagGroupSchema, TagGroupSelectionMode, TagGroupTranslations, TagVariant } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideTagGroup, provideTagGroupItem, useTagGroupContext, useTagGroupItemContext } from './context'
import { useTagGroup } from './use-tag-group'

type TagGroupProps = TagGroupSchema['props']

/** 默认插槽的载荷：选中集合、选择模式与焦点锚点，以及判定选中与整份赋值、单选、切换、摘除的命令。 */
export type TagGroupRootSlotProps = Pick<
  TagGroupApi,
  'value' | 'selectionMode' | 'focusedValue' | 'isSelected' | 'setValue' | 'select' | 'toggle' | 'deleteItem'
>

export const XhTagGroupRoot = defineComponent({
  name: 'XhTagGroupRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    collection: { type: Array as PropType<TagGroupNode[]>, default: undefined },
    /** 标题文字。给了它就不必再写 label 部件；要放别的内容改用 label 插槽。 */
    label: { type: String, default: undefined },
    value: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    defaultValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    selectionMode: { type: String as PropType<TagGroupSelectionMode>, default: undefined },
    deletable: Boolean,
    disabled: Boolean,
    readOnly: Boolean,
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
    typeahead: { type: Boolean, default: undefined },
    variant: { type: String as PropType<TagVariant>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    translations: { type: Object as PropType<Partial<TagGroupTranslations>>, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸集合；回传值恒为数组，单选时长度 ≤ 1。
  // item-delete 只报「用户要摘这一枚」，条目的去留由宿主改自己的数据
  emits: {
    'value-change': (_details: PayloadOf<TagGroupProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<TagGroupProps, 'onValueChange'>['value']) => true,
    'item-delete': (_details: PayloadOf<TagGroupProps, 'onItemDelete'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: TagGroupRootSlotProps) => VNode[]
    label?: () => VNode[]
    item?: (node: TagGroupNodeMeta) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: TagGroupProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyDelete: TagGroupProps['onItemDelete'] = (details) => {
      emit('item-delete', details)
    }
    const ctx = useTagGroup(withXhConfig('tag-group', props) as TagGroupProps, notify, notifyDelete)
    provideTagGroup(ctx)
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
          deleteItem: ctx.api.value.deleteItem,
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

export const XhTagGroupLabel = defineComponent({
  name: 'XhTagGroupLabel',
  setup(_, { slots }) {
    const ctx = useTagGroupContext()
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTagGroupList = defineComponent({
  name: 'XhTagGroupList',
  setup(_, { slots }) {
    const ctx = useTagGroupContext()
    return () => h('div', ctx.api.value.getListProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 一枚标签：渲出来是 tag 的 root（data-scope="tag"），组把行角色、Tab 停靠点、选中与锚点叠在它上面。 */
export const XhTagGroupItem = defineComponent({
  name: 'XhTagGroupItem',
  props: {
    value: { type: String, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的声明
    disabled: { type: Boolean, default: undefined },
    deletable: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useTagGroupContext()
    const item = computed<TagGroupItemProps>(() => ({
      value: props.value,
      disabled: props.disabled,
      deletable: props.deletable,
    }))
    provideTagGroupItem({ item })
    // 本条目持有焦点时，value 变更重报焦点条目，卸载时上报整组失焦
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
      'span',
      { ...ctx.api.value.getItemProps(item.value) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})

export const XhTagGroupCell = defineComponent({
  name: 'XhTagGroupCell',
  setup(_, { slots }) {
    const ctx = useTagGroupContext()
    const { item } = useTagGroupItemContext()
    return () => h('span', ctx.api.value.getCellProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 标签文字：渲出来是 tag 的 label。 */
export const XhTagGroupItemText = defineComponent({
  name: 'XhTagGroupItemText',
  setup(_, { slots }) {
    const ctx = useTagGroupContext()
    const { item } = useTagGroupItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 摘除钮：渲出来是所在标签那份 tag 的 close-trigger，不占 Tab 位；整组没开放摘除时收起。 */
export const XhTagGroupItemDeleteTrigger = defineComponent({
  name: 'XhTagGroupItemDeleteTrigger',
  setup(_, { slots }) {
    const ctx = useTagGroupContext()
    const { item } = useTagGroupItemContext()
    return () => h('button', ctx.api.value.getItemDeleteTriggerProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 没写默认插槽时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写默认插槽。
 */
function renderDefaultTree(
  collection: readonly TagGroupNodeMeta[],
  label: (VNode | string)[] | null,
  itemSlot?: (node: TagGroupNodeMeta) => VNode[],
): VNode[] {
  return [
    ...(label ? [h(XhTagGroupLabel, null, () => label)] : []),
    h(XhTagGroupList, null, () => collection.map(node =>
      h(XhTagGroupItem, { key: node.value, value: node.value }, () => [
        h(XhTagGroupCell, null, () => [
          h(XhTagGroupItemText, null, () => itemSlot?.(node) ?? node.label),
          h(XhTagGroupItemDeleteTrigger),
        ]),
      ]),
    )),
  ]
}
