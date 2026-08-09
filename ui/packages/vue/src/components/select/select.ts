import type { Direction, Placement } from '@xihan-ui/core'
import type { SelectItemProps, SelectOpenChangeDetails, SelectSchema, SelectValueChangeDetails } from '@xihan-ui/headless'
import type { PropType, VNode } from 'vue'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { provideSelect, provideSelectItem, useSelectContext, useSelectItemContext } from './context'
import { useSelect } from './use-select'

type SelectProps = SelectSchema['props']

export const XhSelectRoot = defineComponent({
  name: 'XhSelectRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    value: { type: [String, Array] as PropType<string | string[] | null>, default: undefined },
    defaultValue: { type: [String, Array] as PropType<string | string[] | null>, default: undefined },
    multiple: Boolean,
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    disabled: Boolean,
    required: Boolean,
    name: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    variant: { type: String, default: undefined },
    tone: { type: String, default: undefined },
    size: { type: String, default: undefined },
  },
  // *-change 携带 details 对象，update:* 携带裸值。
  // 校验函数恒真，只声明载荷类型：'update:value' 是 string[]，单选也是长度 1 的数组而非裸串。
  emits: {
    'value-change': (_details: SelectValueChangeDetails) => true,
    'open-change': (_details: SelectOpenChangeDetails) => true,
    'update:value': (_value: string[]) => true,
    'update:open': (_open: boolean) => true,
  },
  setup(props, { slots, emit }) {
    const notifyValue: SelectProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyOpen: SelectProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const ctx = useSelect(props as SelectProps, notifyValue, notifyOpen)
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
      ...(slots.default?.({
        open: ctx.api.value.open,
        value: ctx.api.value.value,
        displayText: ctx.api.value.displayText,
        setOpen: ctx.api.value.setOpen,
        setValue: ctx.api.value.setValue,
      }) ?? []),
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
    disabled: Boolean,
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
