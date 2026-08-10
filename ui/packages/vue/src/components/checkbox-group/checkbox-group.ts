import type { Orientation } from '@xihan-ui/core'
import type { CheckboxGroupItemProps, CheckboxGroupNode, CheckboxGroupNodeMeta, CheckboxGroupSchema } from '@xihan-ui/headless'
import type { PropType, VNode } from 'vue'
import { computed, defineComponent, h } from 'vue'
import {
  provideCheckboxGroup,
  provideCheckboxGroupItem,
  useCheckboxGroupContext,
  useCheckboxGroupItemContext,
} from './context'
import { useCheckboxGroup } from './use-checkbox-group'

type CheckboxGroupProps = CheckboxGroupSchema['props']

export const XhCheckboxGroupRoot = defineComponent({
  name: 'XhCheckboxGroupRoot',
  props: {
    collection: { type: Array as PropType<CheckboxGroupNode[]>, default: undefined },
    /** 标题文字。给了它就不必再写 label 部件；要放别的内容改用 label 插槽。 */
    label: { type: String, default: undefined },
    // default: undefined 表示非受控
    value: { type: Array as PropType<string[]>, default: undefined },
    defaultValue: { type: Array as PropType<string[]>, default: undefined },
    itemValues: { type: Array as PropType<string[]>, default: undefined },
    disabled: Boolean,
    readOnly: Boolean,
    invalid: Boolean,
    name: { type: String, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸数组
  emits: ['value-change', 'update:value'],
  setup(props, { slots, emit }) {
    const notify: CheckboxGroupProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useCheckboxGroup(props as CheckboxGroupProps, notify)
    provideCheckboxGroup(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default
      ? slots.default({
          value: ctx.api.value.value,
          checkedState: ctx.api.value.checkedState,
          isChecked: ctx.api.value.isChecked,
          setValue: ctx.api.value.setValue,
          toggleValue: ctx.api.value.toggleValue,
        })
      : props.collection
        ? renderDefaultTree(
            ctx.api.value.collection,
            slots.label?.() ?? (props.label != null ? [props.label] : null),
            slots.item,
          )
        : [])
  },
})

export const XhCheckboxGroupLabel = defineComponent({
  name: 'XhCheckboxGroupLabel',
  setup(_, { slots }) {
    const ctx = useCheckboxGroupContext()
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCheckboxGroupItem = defineComponent({
  name: 'XhCheckboxGroupItem',
  props: {
    value: { type: String, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useCheckboxGroupContext()
    const item = computed<CheckboxGroupItemProps>(() => ({ value: props.value, disabled: props.disabled }))
    provideCheckboxGroupItem({ item })
    // 表单影子由条目自行装配，不暴露成独立组件，作者只写方框与文本
    return () => h('div', ctx.api.value.getItemProps(item.value) as Record<string, unknown>, [
      h('input', ctx.api.value.getItemHiddenInputProps(item.value) as Record<string, unknown>),
      ...(slots.default?.() ?? []),
    ])
  },
})

export const XhCheckboxGroupItemControl = defineComponent({
  name: 'XhCheckboxGroupItemControl',
  setup(_, { slots }) {
    const ctx = useCheckboxGroupContext()
    const { item } = useCheckboxGroupItemContext()
    // 插槽留给作者放对勾图形，方框本身对读屏隐藏
    return () => h('span', ctx.api.value.getItemControlProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhCheckboxGroupItemText = defineComponent({
  name: 'XhCheckboxGroupItemText',
  setup(_, { slots }) {
    const ctx = useCheckboxGroupContext()
    const { item } = useCheckboxGroupItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhCheckboxGroupTrigger = defineComponent({
  name: 'XhCheckboxGroupTrigger',
  setup(_, { slots }) {
    const ctx = useCheckboxGroupContext()
    // 与条目同形的 role=checkbox 节点，渲染为 div，Space 由 connect 接管
    return () => h('div', ctx.api.value.getTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 没写默认插槽时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写默认插槽，行为不变。
 * 全选把手不在其中：它是可选部件，要它就写默认插槽。
 */
function renderDefaultTree(
  collection: readonly CheckboxGroupNodeMeta[],
  label: (VNode | string)[] | null,
  itemSlot?: (node: CheckboxGroupNodeMeta) => VNode[],
): VNode[] {
  return [
    ...(label ? [h(XhCheckboxGroupLabel, null, () => label)] : []),
    ...collection.map(node =>
      h(XhCheckboxGroupItem, { key: node.value, value: node.value }, () => [
        h(XhCheckboxGroupItemControl),
        h(XhCheckboxGroupItemText, null, () => itemSlot?.(node) ?? node.label),
      ]),
    ),
  ]
}
