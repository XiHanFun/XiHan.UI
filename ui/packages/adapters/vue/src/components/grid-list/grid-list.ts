/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 grid list 相关实现。

import type { ControlVariant, Direction, Size, Tone } from '@xihan-ui/core'
import type { GridListNode, GridListRowProps, GridListSchema, GridListSelectionMode, GridListTranslations } from '@xihan-ui/headless'
import type { PropType, SetupContext, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import type { PropsOf } from '../../runtime/props-of'
import { computed, defineComponent, h, onUnmounted } from 'vue'
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
    /** 点行触发行主操作（action，比如看详情）而不是选中；选中只由行首方框与空格键改变。 */
    actionOnClick: Boolean,
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
      return h('div', api.getRootProps(), slots.default?.())
    }
  },
})

export const XhGridListLabel = defineComponent({
  name: 'XhGridListLabel',
  setup(_, { slots }) {
    const context = useGridListContext()
    // 渲出来就登记，在 setup 里同步做：排在输入之前时首帧与服务端直出就带上名字
    context.labelCount.value++
    onUnmounted(() => {
      context.labelCount.value--
    })
    return () => h('span', context.api.value.getLabelProps(), slots.default?.())
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
    return () => h('div', context.api.value.getRowProps(row.value), slots.default?.())
  },
})

/** 行里几个部件共用的 setup，只在取哪一份部件属性与渲染成什么标签上不同。 */
function rowPartSetup(getter: keyof Pick<
  ReturnType<typeof useGridList>['api']['value'],
  'getRowSelectionIndicatorProps' | 'getRowContentProps' | 'getRowTextProps' | 'getRowDescriptionProps' | 'getRowActionsProps'
>, tag: 'div' | 'span' = 'div'): (props: unknown, ctx: Pick<SetupContext, 'slots'>) => () => VNode {
  return (_, { slots }) => {
    const context = useGridListContext()
    const row = useGridListRow()
    return () => h(tag, (context.api.value[getter] as (props: GridListRowProps) => Record<string, unknown>)(row.value), slots.default?.())
  }
}

// 选择标记与同族条目指示器一样是 span，与 React 版同一个标签
export const XhGridListRowSelectionIndicator = defineComponent({ name: 'XhGridListRowSelectionIndicator', setup: rowPartSetup('getRowSelectionIndicatorProps', 'span') })
export const XhGridListRowContent = defineComponent({ name: 'XhGridListRowContent', setup: rowPartSetup('getRowContentProps') })
export const XhGridListRowText = defineComponent({ name: 'XhGridListRowText', setup: rowPartSetup('getRowTextProps') })
export const XhGridListRowDescription = defineComponent({ name: 'XhGridListRowDescription', setup: rowPartSetup('getRowDescriptionProps') })
export const XhGridListRowActions = defineComponent({ name: 'XhGridListRowActions', setup: rowPartSetup('getRowActionsProps') })

export const XhGridListRowAction = defineComponent({
  name: 'XhGridListRowAction',
  setup(_, { slots }) {
    const context = useGridListContext()
    const row = useGridListRow()
    return () => h('button', context.api.value.getRowActionProps(row.value), slots.default?.())
  },
})

export const XhGridListEmpty = defineComponent({
  name: 'XhGridListEmpty',
  setup(_, { slots }) {
    const context = useGridListContext()
    return () => h('div', context.api.value.getEmptyProps(), slots.default?.())
  },
})

export const XhGridListLoading = defineComponent({
  name: 'XhGridListLoading',
  setup(_, { slots }) {
    const context = useGridListContext()
    return () => h('div', context.api.value.getLoadingProps(), slots.default?.())
  },
})

// 各组件接受的 props，与 React 同名
export type XhGridListEmptyProps = PropsOf<typeof XhGridListEmpty>
export type XhGridListLabelProps = PropsOf<typeof XhGridListLabel>
export type XhGridListLoadingProps = PropsOf<typeof XhGridListLoading>
export type XhGridListRootProps = PropsOf<typeof XhGridListRoot>
export type XhGridListRowProps = PropsOf<typeof XhGridListRow>
export type XhGridListRowActionProps = PropsOf<typeof XhGridListRowAction>
export type XhGridListRowActionsProps = PropsOf<typeof XhGridListRowActions>
export type XhGridListRowContentProps = PropsOf<typeof XhGridListRowContent>
export type XhGridListRowDescriptionProps = PropsOf<typeof XhGridListRowDescription>
export type XhGridListRowSelectionIndicatorProps = PropsOf<typeof XhGridListRowSelectionIndicator>
export type XhGridListRowTextProps = PropsOf<typeof XhGridListRowText>
