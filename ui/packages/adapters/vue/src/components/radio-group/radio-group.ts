import type { RadioGroupItemProps, RadioGroupNode, RadioGroupNodeMeta, RadioGroupSchema } from '@xihan-ui/headless'
import type { Direction, Orientation, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, VNode } from 'vue'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { provideRadioGroup, provideRadioGroupItem, useRadioGroupContext, useRadioGroupItemContext } from './context'
import { useRadioGroup } from './use-radio-group'

type RadioGroupProps = RadioGroupSchema['props']

export const XhRadioGroupRoot = defineComponent({
  name: 'XhRadioGroupRoot',
  props: {
    collection: { type: Array as PropType<RadioGroupNode[]>, default: undefined },
    /** 标题文字。给了它就不必再写 label 部件；要放别的内容改用 label 插槽。 */
    label: { type: String, default: undefined },
    value: { type: String as PropType<string | null>, default: undefined },
    defaultValue: { type: String as PropType<string | null>, default: undefined },
    disabled: Boolean,
    orientation: { type: String as PropType<Orientation>, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    name: { type: String, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸值
  emits: ['value-change', 'update:value'],
  setup(props, { slots, emit }) {
    const notify: RadioGroupProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useRadioGroup(props as RadioGroupProps, notify)
    provideRadioGroup(ctx)
    return () => h(
      'div',
      ctx.api.value.getRootProps() as Record<string, unknown>,
      slots.default
        ? slots.default()
        : props.collection
          ? renderDefaultTree(
              ctx.api.value.collection,
              slots.label?.() ?? (props.label != null ? [props.label] : null),
              slots.item,
            )
          : [],
    )
  },
})

export const XhRadioGroupLabel = defineComponent({
  name: 'XhRadioGroupLabel',
  setup(_, { slots }) {
    const ctx = useRadioGroupContext()
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhRadioGroupItem = defineComponent({
  name: 'XhRadioGroupItem',
  props: {
    value: { type: String, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useRadioGroupContext()
    const item = computed<RadioGroupItemProps>(() => ({ value: props.value, disabled: props.disabled }))
    provideRadioGroupItem({ item })
    // 本条目持有焦点时，value 变更重报焦点条目，卸载时上报整组失焦
    const itemEl = ref<HTMLElement | null>(null)
    watch(() => props.value, (next, prev) => {
      if (next === prev)
        return
      const svc = ctx.service
      if (svc.getStatus() !== 'Started')
        return
      if (itemEl.value && svc.scope.getActiveElement() === itemEl.value)
        svc.send({ type: 'ITEM.FOCUS', value: next })
    })
    onBeforeUnmount(() => {
      const { service } = ctx
      if (service.getStatus() !== 'Started')
        return
      // 按「本节点当下正持有焦点」判定，不按 value 比对
      if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
        service.send({ type: 'GROUP.BLUR' })
    })
    // 隐藏输入与 indicator 由条目自行装配，不暴露成独立组件
    return () => h('div', { ...ctx.api.value.getItemProps(item.value) as Record<string, unknown>, ref: itemEl }, [
      h('input', ctx.api.value.getHiddenInputProps(item.value) as Record<string, unknown>),
      h('span', ctx.api.value.getIndicatorProps(item.value) as Record<string, unknown>),
      ...(slots.default?.() ?? []),
    ])
  },
})

export const XhRadioGroupItemText = defineComponent({
  name: 'XhRadioGroupItemText',
  setup(_, { slots }) {
    const ctx = useRadioGroupContext()
    const { item } = useRadioGroupItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 没写默认插槽时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写默认插槽，行为不变。
 */
function renderDefaultTree(
  collection: readonly RadioGroupNodeMeta[],
  label: (VNode | string)[] | null,
  itemSlot?: (node: RadioGroupNodeMeta) => VNode[],
): VNode[] {
  return [
    ...(label ? [h(XhRadioGroupLabel, null, () => label)] : []),
    // 条目内的 hidden-input 与 indicator 由 XhRadioGroupItem 自行装配
    ...collection.map(node => h(XhRadioGroupItem, { key: node.value, value: node.value }, () => [
      h(XhRadioGroupItemText, null, () => itemSlot?.(node) ?? node.label),
    ])),
  ]
}
