/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 grid list 相关实现。

import type { ControlVariant, Direction, Size, Tone } from '@xihan-ui/core'
import type { GridListNode, GridListRowProps, GridListSchema, GridListSelectionMode, GridListTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideGridList, provideGridListRow, useGridListContext, useGridListRow } from './context'
import { useGridList } from './use-grid-list'

type GridListProps = GridListSchema['props']

export const XhGridListRoot = defineComponent({
  name: 'XhGridListRoot',
  props: {
    collection: { type: Array as PropType<GridListNode[]> },
    value: { type: [String, Array] as PropType<string | string[]> },
    defaultValue: { type: [String, Array] as PropType<string | string[]> },
    selectionMode: { type: String as PropType<GridListSelectionMode> },
    disabled: Boolean,
    readOnly: Boolean,
    invalid: Boolean,
    loading: Boolean,
    loop: { type: Boolean, default: undefined },
    typeahead: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction> },
    variant: { type: String as PropType<ControlVariant> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    translations: { type: Object as PropType<Partial<GridListTranslations>> },
  },
  emits: {
    'value-change': (_details: PayloadOf<GridListProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<GridListProps, 'onValueChange'>['value']) => true,
    'action': (_details: PayloadOf<GridListProps, 'onAction'>) => true,
  },
  slots: Object as SlotsType<{ default?: () => VNode[] }>,
  setup(props, { slots, emit }) {
    const context = useGridList(
      withXhConfig('grid-list', props) as GridListProps,
      (details) => {
        emit('value-change', details)
        emit('update:value', details.value)
      },
      details => emit('action', details),
    )
    provideGridList(context)
    return () => {
      const api = context.api.value
      return h('div', api.getRootProps() as Record<string, unknown>, slots.default?.())
    }
  },
})

export const XhGridListLabel = defineComponent({
  name: 'XhGridListLabel',
  setup(_, { slots }) {
    const context = useGridListContext()
    return () => h('span', context.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhGridListRow = defineComponent({
  name: 'XhGridListRow',
  props: {
    value: { type: String, required: true },
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const context = useGridListContext()
    const row = computed<GridListRowProps>(() => ({ value: props.value, disabled: props.disabled }))
    provideGridListRow(row)
    return () => h('div', context.api.value.getRowProps(row.value) as Record<string, unknown>, slots.default?.())
  },
})

function rowPart(name: string, getter: keyof Pick<
  ReturnType<typeof useGridList>['api']['value'],
  'getRowSelectionIndicatorProps' | 'getRowContentProps' | 'getRowTextProps' | 'getRowDescriptionProps' | 'getRowActionsProps'
>): ReturnType<typeof defineComponent> {
  return defineComponent({
    name,
    setup(_, { slots }) {
      const context = useGridListContext()
      const row = useGridListRow()
      return () => h('div', (context.api.value[getter] as (props: GridListRowProps) => Record<string, unknown>)(row.value), slots.default?.())
    },
  })
}

export const XhGridListRowSelectionIndicator = rowPart('XhGridListRowSelectionIndicator', 'getRowSelectionIndicatorProps')
export const XhGridListRowContent = rowPart('XhGridListRowContent', 'getRowContentProps')
export const XhGridListRowText = rowPart('XhGridListRowText', 'getRowTextProps')
export const XhGridListRowDescription = rowPart('XhGridListRowDescription', 'getRowDescriptionProps')
export const XhGridListRowActions = rowPart('XhGridListRowActions', 'getRowActionsProps')

export const XhGridListRowAction = defineComponent({
  name: 'XhGridListRowAction',
  setup(_, { slots }) {
    const context = useGridListContext()
    const row = useGridListRow()
    return () => h('button', context.api.value.getRowActionProps(row.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhGridListEmpty = defineComponent({
  name: 'XhGridListEmpty',
  setup(_, { slots }) {
    const context = useGridListContext()
    return () => h('div', context.api.value.getEmptyProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhGridListLoading = defineComponent({
  name: 'XhGridListLoading',
  setup(_, { slots }) {
    const context = useGridListContext()
    return () => h('div', context.api.value.getLoadingProps() as Record<string, unknown>, slots.default?.())
  },
})
