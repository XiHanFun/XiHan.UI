/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 field array 相关实现。

import type { FieldArrayApi, FieldArrayCellSlotData, FieldArrayColumn, FieldArrayItem, FieldArrayItemProps, FieldArrayLayout, FieldArraySchema, FieldArrayTranslations, FormPath } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { fieldArrayStructure } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { renderStructure } from '../../runtime/structure'
import { useFieldGroupWiring, useFieldLabelWiring } from '../field/use-field-control'
import { useOptionalFormContext } from '../form/context'
import { useFormControlProps } from '../form/use-form-control'
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
  | 'insert'
  | 'remove'
  | 'move'
  | 'moveUp'
  | 'moveDown'
>

/** item-content 插槽的载荷：这一行。 */
export interface FieldArrayItemContentSlotProps {
  item: FieldArrayItem
}

/** item-cell 插槽的载荷：所在的行与列。 */
export type FieldArrayItemCellSlotProps = FieldArrayCellSlotData

export const XhFieldArrayRoot = defineComponent({
  name: 'XhFieldArrayRoot',
  // 有 connect 与机器兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
    ariaLabel: { type: String },
    // 缺席值 undefined 表示非受控
    value: { type: Array as PropType<unknown[]> },
    defaultValue: { type: Array as PropType<unknown[]> },
    min: { type: Number },
    max: { type: Number },
    createItem: { type: Function as PropType<() => unknown> },
    movable: Boolean,
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    /** 排布：list（缺省）一行一条纵向堆叠；table 是 role=table 的表格，表头与各行共用一套列宽。 */
    layout: { type: String as PropType<FieldArrayLayout> },
    /** 表格排布的各列，只在 table 排布下生效；顺序即列序。 */
    columns: { type: Array as PropType<FieldArrayColumn[]> },
    name: { type: [String, Array] as PropType<FormPath> },
    translations: { type: Object as PropType<Partial<FieldArrayTranslations>> },
  },
  // value-change 携带 { value }，update:value 携带裸数组
  emits: {
    'value-change': (_details: PayloadOf<FieldArrayProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<FieldArrayProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    'default'?: (props: FieldArrayRootSlotProps) => VNode[]
    /** 不写默认插槽时每一行的作者内容（列表排布），载荷是这一行。 */
    'item-content'?: (props: FieldArrayItemContentSlotProps) => VNode[]
    /** 不写默认插槽时每一格的作者内容（表格排布），载荷是所在的行与列。 */
    'item-cell'?: (props: FieldArrayItemCellSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const form = useOptionalFormContext()
    const onValueChange: FieldArrayProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useFieldArray(withXhConfig('field-array', useFormControlProps(props)) as FieldArrayProps, { onValueChange }, form?.service)
    provideFieldArray(ctx)
    // 写了默认插槽时 items 里每一项都带 key，作者铺行时直接 :key="row.key"；没写时照 fieldArrayStructure 铺整套结构
    return () => h('div', { ...(ctx.api.value.getRootProps() as Record<string, unknown>), ref: ctx.rootRef }, !slots.default
      ? renderDefaultStructure(ctx.api.value, { 'item-content': slots['item-content'], 'item-cell': slots['item-cell'] })
      : slots.default({
          items: ctx.api.value.items,
          value: ctx.api.value.value,
          count: ctx.api.value.count,
          empty: ctx.api.value.empty,
          atMin: ctx.api.value.atMin,
          atMax: ctx.api.value.atMax,
          canAdd: ctx.api.value.canAdd,
          setValue: ctx.api.value.setValue,
          add: ctx.api.value.add,
          insert: ctx.api.value.insert,
          remove: ctx.api.value.remove,
          move: ctx.api.value.move,
          moveUp: ctx.api.value.moveUp,
          moveDown: ctx.api.value.moveDown,
        }))
  },
})

export const XhFieldArrayTable = defineComponent({
  name: 'XhFieldArrayTable',
  setup(_, { slots }) {
    // 表格排布下放进字段时，字段的标签并进表格的名字链、说明与错误文案进描述链；列表排布下表格不带角色，不接线
    const fieldWiring = useFieldGroupWiring()
    const fieldLabel = useFieldLabelWiring()
    const ctx = useFieldArrayContext()
    return () => {
      const props = ctx.api.value.getTableProps() as Record<string, unknown>
      return h('div', ctx.api.value.layout === 'table' ? fieldLabel.value({ ...fieldWiring.value, ...props }) : props, slots.default?.())
    }
  },
})

export const XhFieldArrayHeader = defineComponent({
  name: 'XhFieldArrayHeader',
  setup(_, { slots }) {
    const ctx = useFieldArrayContext()
    return () => h('div', ctx.api.value.getHeaderProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhFieldArrayColumnHeader = defineComponent({
  name: 'XhFieldArrayColumnHeader',
  props: {
    /** 列 id，与 columns 里的 id 对应。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useFieldArrayContext()
    // 没写内容时显示这一列的 label
    return () => h('div', ctx.api.value.getColumnHeaderProps({ value: props.value }) as Record<string, unknown>, slots.default?.()
      ?? ctx.api.value.columns.find(column => column.id === props.value)?.label)
  },
})

export const XhFieldArrayItemCell = defineComponent({
  name: 'XhFieldArrayItemCell',
  props: {
    /** 列 id，与 columns 里的 id 对应。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useFieldArrayContext()
    const { item } = useFieldArrayItemContext()
    return () => h('div', ctx.api.value.getItemCellProps({ index: item.value.index, value: props.value }) as Record<string, unknown>, slots.default?.())
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

/** 行前的行号或名目；纯标注，不与行内的控件建立 for 关联。 */
export const XhFieldArrayItemLabel = defineComponent({
  name: 'XhFieldArrayItemLabel',
  setup(_, { slots }) {
    const ctx = useFieldArrayContext()
    const { item } = useFieldArrayItemContext()
    return () => h('span', ctx.api.value.getItemLabelProps(item.value) as Record<string, unknown>, slots.default?.())
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

/** 结构里的部件 → 部件组件。 */
const FIELD_ARRAY_PARTS = {
  'table': XhFieldArrayTable,
  'header': XhFieldArrayHeader,
  'column-header': XhFieldArrayColumnHeader,
  'item': XhFieldArrayItem,
  'item-label': XhFieldArrayItemLabel,
  'item-content': XhFieldArrayItemContent,
  'item-cell': XhFieldArrayItemCell,
  'item-action': XhFieldArrayItemAction,
  'add-trigger': XhFieldArrayAddTrigger,
  'item-delete-trigger': XhFieldArrayItemDeleteTrigger,
  'move-up-trigger': XhFieldArrayMoveUpTrigger,
  'move-down-trigger': XhFieldArrayMoveDownTrigger,
}

interface FieldArrayStructureSlots {
  'item-content'?: (props: FieldArrayItemContentSlotProps) => VNode[]
  'item-cell'?: (props: FieldArrayItemCellSlotProps) => VNode[]
}

/**
 * 未写默认插槽时照 fieldArrayStructure 铺开的整套结构，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 每一行（表格排布下每一格）的内容由 item-content / item-cell 插槽给出，没给时那一格空着。
 */
function renderDefaultStructure(api: FieldArrayApi, content: FieldArrayStructureSlots): VNode[] {
  return renderStructure(fieldArrayStructure(api), FIELD_ARRAY_PARTS, (node) => {
    if (node.slot?.name === 'item-content')
      return content['item-content']?.({ item: node.data as FieldArrayItem })
    if (node.slot?.name === 'item-cell')
      return content['item-cell']?.(node.data as FieldArrayCellSlotData)
    return undefined
  })
}
