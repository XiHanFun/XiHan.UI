import type { Direction, Orientation } from '@xihan-ui/core'
import type { RadioGroupItemProps, RadioGroupSchema } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { provideRadioGroup, provideRadioGroupItem, useRadioGroupContext, useRadioGroupItemContext } from './context'
import { useRadioGroup } from './use-radio-group'

type RadioGroupProps = RadioGroupSchema['props']

export const XhRadioGroupRoot = defineComponent({
  name: 'XhRadioGroupRoot',
  props: {
    value: { type: String as PropType<string | null>, default: undefined },
    defaultValue: { type: String as PropType<string | null>, default: undefined },
    disabled: Boolean,
    orientation: { type: String as PropType<Orientation>, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    name: { type: String, default: undefined },
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
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
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
    disabled: Boolean,
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
