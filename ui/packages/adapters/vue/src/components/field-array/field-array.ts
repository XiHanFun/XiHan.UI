import type { FieldArrayApi, FieldArrayItemProps, FieldArraySchema, FieldArrayTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideFieldArray, provideFieldArrayItem, useFieldArrayContext, useFieldArrayItemContext } from './context'
import { useFieldArray } from './use-field-array'

type FieldArrayProps = FieldArraySchema['props']

/** 默认插槽的载荷：逐行投影与整份值、行数与上下限状态，以及整份替换、增删、移动的动作。 */
export type FieldArrayRootSlotProps = Pick<
  FieldArrayApi,
  | 'items'
  | 'value'
  | 'count'
  | 'empty'
  | 'atMin'
  | 'atMax'
  | 'canAdd'
  | 'setValue'
  | 'add'
  | 'remove'
  | 'move'
  | 'moveUp'
  | 'moveDown'
>

export const XhFieldArrayRoot = defineComponent({
  name: 'XhFieldArrayRoot',
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
    translations: { type: Object as PropType<Partial<FieldArrayTranslations>>, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸数组
  emits: {
    'value-change': (_details: PayloadOf<FieldArrayProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<FieldArrayProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: FieldArrayRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const onValueChange: FieldArrayProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useFieldArray(withXhConfig('field-array', props) as FieldArrayProps, { onValueChange })
    provideFieldArray(ctx)
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

export const XhFieldArrayItem = defineComponent({
  name: 'XhFieldArrayItem',
  props: {
    // 下标由作者声明，兼收字符串以支持模板里写 index="0"
    index: { type: [Number, String] as PropType<number | string>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useFieldArrayContext()
    const item = computed<FieldArrayItemProps>(() => ({ index: Math.trunc(Number(props.index)) }))
    provideFieldArrayItem({ item })
    return () => h('div', ctx.api.value.getItemProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhFieldArrayItemContent = defineComponent({
  name: 'XhFieldArrayItemContent',
  setup(_, { slots }) {
    const ctx = useFieldArrayContext()
    const { item } = useFieldArrayItemContext()
    return () => h('div', ctx.api.value.getItemContentProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhFieldArrayItemAction = defineComponent({
  name: 'XhFieldArrayItemAction',
  setup(_, { slots }) {
    const ctx = useFieldArrayContext()
    const { item } = useFieldArrayItemContext()
    return () => h('div', ctx.api.value.getItemActionProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhFieldArrayAddTrigger = defineComponent({
  name: 'XhFieldArrayAddTrigger',
  setup(_, { slots }) {
    const ctx = useFieldArrayContext()
    return () => h('button', ctx.api.value.getAddTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhFieldArrayItemDeleteTrigger = defineComponent({
  name: 'XhFieldArrayItemDeleteTrigger',
  setup(_, { slots }) {
    const ctx = useFieldArrayContext()
    const { item } = useFieldArrayItemContext()
    return () => h('button', ctx.api.value.getItemDeleteTriggerProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhFieldArrayMoveUpTrigger = defineComponent({
  name: 'XhFieldArrayMoveUpTrigger',
  setup(_, { slots }) {
    const ctx = useFieldArrayContext()
    const { item } = useFieldArrayItemContext()
    return () => h('button', ctx.api.value.getMoveUpTriggerProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhFieldArrayMoveDownTrigger = defineComponent({
  name: 'XhFieldArrayMoveDownTrigger',
  setup(_, { slots }) {
    const ctx = useFieldArrayContext()
    const { item } = useFieldArrayItemContext()
    return () => h('button', ctx.api.value.getMoveDownTriggerProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})
