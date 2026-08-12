import type { DynamicInputItemProps, DynamicInputSchema, DynamicInputTranslations } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideDynamicInput, provideDynamicInputItem, useDynamicInputContext, useDynamicInputItemContext } from './context'
import { useDynamicInput } from './use-dynamic-input'

type DynamicInputProps = DynamicInputSchema['props']

export const XhDynamicInputRoot = defineComponent({
  name: 'XhDynamicInputRoot',
  // 有 connect 与机器兜底的 prop 一律 default: undefined
  props: {
    // default: undefined 表示非受控
    value: { type: Array as PropType<unknown[]>, default: undefined },
    defaultValue: { type: Array as PropType<unknown[]>, default: undefined },
    min: { type: Number, default: undefined },
    max: { type: Number, default: undefined },
    createItem: { type: Function as PropType<() => unknown>, default: undefined },
    movable: Boolean,
    disabled: Boolean,
    translations: { type: Object as PropType<Partial<DynamicInputTranslations>>, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸数组
  emits: {
    'value-change': (_details: PayloadOf<DynamicInputProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<DynamicInputProps, 'onValueChange'>['value']) => true,
  },
  setup(props, { slots, emit }) {
    const onValueChange: DynamicInputProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useDynamicInput(withXhConfig('dynamic-input', props) as DynamicInputProps, { onValueChange })
    provideDynamicInput(ctx)
    // items 里每一项都带 key，作者铺行时直接 :key="row.key"
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      items: ctx.api.value.items,
      value: ctx.api.value.value,
      count: ctx.api.value.count,
      empty: ctx.api.value.empty,
      atMin: ctx.api.value.atMin,
      atMax: ctx.api.value.atMax,
      canAdd: ctx.api.value.canAdd,
      setValue: ctx.api.value.setValue,
      add: ctx.api.value.add,
      remove: ctx.api.value.remove,
      move: ctx.api.value.move,
      moveUp: ctx.api.value.moveUp,
      moveDown: ctx.api.value.moveDown,
    }))
  },
})

export const XhDynamicInputItem = defineComponent({
  name: 'XhDynamicInputItem',
  props: {
    // 下标由作者声明，兼收字符串以支持模板里写 index="0"
    index: { type: [Number, String] as PropType<number | string>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useDynamicInputContext()
    const item = computed<DynamicInputItemProps>(() => ({ index: Math.trunc(Number(props.index)) }))
    provideDynamicInputItem({ item })
    return () => h('div', ctx.api.value.getItemProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhDynamicInputItemContent = defineComponent({
  name: 'XhDynamicInputItemContent',
  setup(_, { slots }) {
    const ctx = useDynamicInputContext()
    const { item } = useDynamicInputItemContext()
    return () => h('div', ctx.api.value.getItemContentProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhDynamicInputItemAction = defineComponent({
  name: 'XhDynamicInputItemAction',
  setup(_, { slots }) {
    const ctx = useDynamicInputContext()
    const { item } = useDynamicInputItemContext()
    return () => h('div', ctx.api.value.getItemActionProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhDynamicInputAddTrigger = defineComponent({
  name: 'XhDynamicInputAddTrigger',
  setup(_, { slots }) {
    const ctx = useDynamicInputContext()
    return () => h('button', ctx.api.value.getAddTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDynamicInputRemoveTrigger = defineComponent({
  name: 'XhDynamicInputRemoveTrigger',
  setup(_, { slots }) {
    const ctx = useDynamicInputContext()
    const { item } = useDynamicInputItemContext()
    return () => h('button', ctx.api.value.getRemoveTriggerProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhDynamicInputMoveUpTrigger = defineComponent({
  name: 'XhDynamicInputMoveUpTrigger',
  setup(_, { slots }) {
    const ctx = useDynamicInputContext()
    const { item } = useDynamicInputItemContext()
    return () => h('button', ctx.api.value.getMoveUpTriggerProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhDynamicInputMoveDownTrigger = defineComponent({
  name: 'XhDynamicInputMoveDownTrigger',
  setup(_, { slots }) {
    const ctx = useDynamicInputContext()
    const { item } = useDynamicInputItemContext()
    return () => h('button', ctx.api.value.getMoveDownTriggerProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})
