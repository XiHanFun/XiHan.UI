import type { SelectApi, SelectItemProps, SelectNode, SelectNodeMeta, SelectOpenChangeDetails, SelectSchema, SelectValueChangeDetails } from '@xihan-ui/headless'
import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideSelect, provideSelectItem, provideSelectTag, useSelectContext, useSelectItemContext, useSelectTagContext } from './context'
import { useSelect } from './use-select'

type SelectProps = SelectSchema['props']

/** 默认插槽的载荷：展开态、选中集合与显示文字、可见标签与被折起的个数，以及改展开、改值、清空、摘值四个动作。 */
export type SelectRootSlotProps = Pick<
  SelectApi,
  'open' | 'value' | 'displayText' | 'tags' | 'overflowCount' | 'setOpen' | 'setValue' | 'clear' | 'deselect'
>

export const XhSelectRoot = defineComponent({
  name: 'XhSelectRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    collection: { type: Array as PropType<SelectNode[]>, default: undefined },
    /** 标题文字。给了它就不必再写 label 部件；要放别的内容改用 label 插槽。 */
    label: { type: String, default: undefined },
    value: { type: [String, Array] as PropType<string | string[] | null>, default: undefined },
    defaultValue: { type: [String, Array] as PropType<string | string[] | null>, default: undefined },
    multiple: Boolean,
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    disabled: Boolean,
    invalid: { type: Boolean, default: undefined },
    required: Boolean,
    name: { type: String, default: undefined },
    translations: { type: Object as PropType<SelectProps['translations']>, default: undefined },
    maxTagCount: { type: Number, default: undefined },
    placeholder: { type: String, default: undefined },
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    variant: { type: String as PropType<ControlVariant>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  // *-change 携带 details 对象，update:* 携带裸值。
  // 校验函数恒真，只声明载荷类型：'update:value' 是 string[]，单选也是长度 1 的数组而非裸串。
  emits: {
    'value-change': (_details: SelectValueChangeDetails) => true,
    'open-change': (_details: SelectOpenChangeDetails) => true,
    'update:value': (_value: string[]) => true,
    'update:open': (_open: boolean) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: SelectRootSlotProps) => VNode[]
    label?: () => VNode[]
    item?: (node: SelectNodeMeta) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notifyValue: SelectProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyOpen: SelectProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const ctx = useSelect(withXhConfig('select', props) as SelectProps, notifyValue, notifyOpen)
    provideSelect(ctx)

    // 表单影子由根部件装配：空串选项打底，每个选中值一个 selected 选项，供 required 判定。
    // 选中态一律靠选项的 selected 表达，多选下 select.value 表达不了集合。
    const hiddenSelect = (): VNode => {
      const api = ctx.api.value
      const options = [h('option', { value: '' })]
      for (const [i, v] of api.value.entries())
        options.push(h('option', { value: v, selected: true }, api.valueText[i] ?? v))
      return h('select', api.getHiddenSelectProps() as Record<string, unknown>, options)
    }

    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, [
      hiddenSelect(),
      ...(slots.default
        ? slots.default({
          open: ctx.api.value.open,
          value: ctx.api.value.value,
          displayText: ctx.api.value.displayText,
          tags: ctx.api.value.tags,
          overflowCount: ctx.api.value.overflowCount,
          setOpen: ctx.api.value.setOpen,
          setValue: ctx.api.value.setValue,
          clear: ctx.api.value.clear,
          deselect: ctx.api.value.deselect,
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

export const XhSelectLabel = defineComponent({
  name: 'XhSelectLabel',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSelectControl = defineComponent({
  name: 'XhSelectControl',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    // 触发器与清空按钮的收纳容器：清空钮据此嵌进触发器右端
    return () => h('div', ctx.api.value.getControlProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSelectTrigger = defineComponent({
  name: 'XhSelectTrigger',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    return () => h('button', {
      ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhSelectValueText = defineComponent({
  name: 'XhSelectValueText',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    // 有插槽用插槽，否则显示选中项文本或 placeholder
    return () => h(
      'span',
      ctx.api.value.getValueTextProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.displayText,
    )
  },
})

export const XhSelectIndicator = defineComponent({
  name: 'XhSelectIndicator',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    return () => h('span', ctx.api.value.getIndicatorProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSelectClearTrigger = defineComponent({
  name: 'XhSelectClearTrigger',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    // 节点常挂，没选中或禁用时靠 hidden 藏掉
    return () => h('button', ctx.api.value.getClearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSelectTag = defineComponent({
  name: 'XhSelectTag',
  props: {
    /** 它代表哪个选中值。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useSelectContext()
    provideSelectTag({ value: () => props.value })
    return () => h('span', ctx.api.value.getTagProps({ value: props.value }) as Record<string, unknown>, slots.default?.())
  },
})

export const XhSelectTagRemove = defineComponent({
  name: 'XhSelectTagRemove',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    const tag = useSelectTagContext()
    return () => h('button', ctx.api.value.getTagRemoveProps({ value: tag.value() }) as Record<string, unknown>, slots.default?.())
  },
})

export const XhSelectPositioner = defineComponent({
  name: 'XhSelectPositioner',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    return () => h('div', {
      ...ctx.api.value.getPositionerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhSelectContent = defineComponent({
  name: 'XhSelectContent',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhSelectItem = defineComponent({
  name: 'XhSelectItem',
  props: {
    value: { type: String, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useSelectContext()
    const item = computed<SelectItemProps>(() => ({ value: props.value, disabled: props.disabled }))
    provideSelectItem({ item })
    // 本条目持有焦点时，value 变更重报高亮条目，卸载时上报条目丢失
    const itemEl = ref<HTMLElement | null>(null)
    watch(() => props.value, (next, prev) => {
      if (next === prev)
        return
      const svc = ctx.service
      if (svc.getStatus() !== 'Started')
        return
      if (itemEl.value && svc.scope.getActiveElement() === itemEl.value)
        svc.send({ type: 'ITEM.HIGHLIGHT', value: next })
    })
    onBeforeUnmount(() => {
      const { service } = ctx
      if (service.getStatus() !== 'Started')
        return
      // 按「本节点当下正持有焦点」判定，不按 value 比对
      if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
        service.send({ type: 'ITEM.LOST' })
    })
    return () => h(
      'div',
      { ...ctx.api.value.getItemProps(item.value) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})

export const XhSelectItemText = defineComponent({
  name: 'XhSelectItemText',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    const { item } = useSelectItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhSelectItemIndicator = defineComponent({
  name: 'XhSelectItemIndicator',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    const { item } = useSelectItemContext()
    return () => h('span', ctx.api.value.getItemIndicatorProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 没写默认插槽时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写默认插槽，行为不变。
 */
function renderDefaultTree(
  collection: readonly SelectNodeMeta[],
  label: (VNode | string)[] | null,
  itemSlot?: (node: SelectNodeMeta) => VNode[],
): VNode[] {
  return [
    ...(label ? [h(XhSelectLabel, null, () => label)] : []),
    h(XhSelectTrigger, null, () => [h(XhSelectValueText), h(XhSelectIndicator)]),
    h(XhSelectPositioner, null, () => [
      h(XhSelectContent, null, () => collection.map(node =>
        h(XhSelectItem, { key: node.value, value: node.value }, () => [
          h(XhSelectItemText, null, () => itemSlot?.(node) ?? node.label),
          h(XhSelectItemIndicator),
        ]),
      )),
    ]),
  ]
}
