/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 filter builder 相关实现。

import type { ControlVariant, Size } from '@xihan-ui/core'
import type { FilterBuilderApi, FilterBuilderCreateId, FilterBuilderSchema, FilterBuilderTranslations, FilterCondition, FilterField, FilterGroup, FilterParameter, FilterPath } from '@xihan-ui/headless'
import type { ComputedRef, PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { filterBuilderStructure } from '@xihan-ui/headless'
import { computed, defineComponent, h, onUnmounted } from 'vue'
import { withXhConfig } from '../../config/config'
import { renderStructure } from '../../runtime/structure'
import { XhDateFieldRoot } from '../date-field/date-field'
import { useFieldGroupWiring, useFieldLabelWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { XhNumberFieldRoot } from '../number-field/number-field'
import { XhSelectRoot } from '../select/select'
import { XhSwitch } from '../switch/switch'
import { XhTagsInputRoot } from '../tags-input/tags-input'
import { XhTextFieldRoot } from '../text-field/text-field'
import { XhToggleGroupRoot } from '../toggle-group/toggle-group'
import {
  provideFilterBuilder,
  provideFilterBuilderCondition,
  provideFilterBuilderGroup,
  useFilterBuilderCondition,
  useFilterBuilderContext,
  useFilterBuilderGroup,
} from './context'
import { useFilterBuilder } from './use-filter-builder'

type FilterBuilderProps = FilterBuilderSchema['props']

/** 默认插槽的载荷：当前的树、视图与改树的方法。 */
export type FilterBuilderRootSlotProps = Pick<
  FilterBuilderApi,
  'value' | 'tree' | 'conditions' | 'hasIssues' | 'hasParameters' | 'announcement' | 'setLogic' | 'addCondition' | 'addGroup' | 'remove' | 'move' | 'setField' | 'setOperator' | 'setOperand' | 'setSource' | 'setIgnoreCase'
>

/** 条件行尾扩展位插槽的载荷。 */
export interface FilterBuilderConditionExtraSlotProps {
  readonly condition: FilterCondition
  readonly path: FilterPath
}

export const XhFilterBuilderRoot = defineComponent({
  name: 'XhFilterBuilderRoot',
  props: {
    /** 不显示出来的名字，写成 aria-label 落在根上；放进字段或渲染了 label 部件时以它们为准。 */
    ariaLabel: { type: String },
    // 缺席值 undefined 表示非受控
    value: { type: Object as PropType<FilterGroup> },
    defaultValue: { type: Object as PropType<FilterGroup> },
    fields: { type: Array as PropType<readonly FilterField[]> },
    parameters: { type: Array as PropType<readonly FilterParameter[]> },
    createId: { type: Function as PropType<FilterBuilderCreateId> },
    maxDepth: { type: Number },
    // undefined 才表示「本实例没说」，缺省 true
    ignoreCase: { type: Boolean, default: undefined },
    // undefined 才表示「本实例没说」，Form/Field 才能安全地下传状态；false 是显式顶掉继承。
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    variant: { type: String as PropType<ControlVariant> },
    size: { type: String as PropType<Size> },
    translations: { type: Object as PropType<FilterBuilderProps['translations']> },
  },
  // value-change 携带 { value }，update:value 携带条件树本身
  emits: {
    'value-change': (_details: PayloadOf<FilterBuilderProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<FilterBuilderProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    'default'?: (props: FilterBuilderRootSlotProps) => VNode[]
    'condition-extra'?: (props: FilterBuilderConditionExtraSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: FilterBuilderProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useFilterBuilder(withXhConfig('filter-builder', useFormControlProps(props)) as FilterBuilderProps, notify)
    provideFilterBuilder(ctx)
    // 放进表单字段时，字段的标题与说明接到根组上
    const fieldWiring = useFieldGroupWiring()
    const fieldLabel = useFieldLabelWiring()
    return () => {
      const api = ctx.api.value
      return h('div', fieldLabel.value({ ...fieldWiring.value, ...api.getRootProps() as Record<string, unknown> }), slots.default
        ? slots.default({
            value: api.value,
            tree: api.tree,
            conditions: api.conditions,
            hasIssues: api.hasIssues,
            hasParameters: api.hasParameters,
            announcement: api.announcement,
            setLogic: api.setLogic,
            addCondition: api.addCondition,
            addGroup: api.addGroup,
            remove: api.remove,
            move: api.move,
            setField: api.setField,
            setOperator: api.setOperator,
            setOperand: api.setOperand,
            setSource: api.setSource,
            setIgnoreCase: api.setIgnoreCase,
          })
        : renderDefaultStructure(api, ctx.translations.value, slots['condition-extra']))
    }
  },
})

export const XhFilterBuilderLabel = defineComponent({
  name: 'XhFilterBuilderLabel',
  setup(_, { slots }) {
    const ctx = useFilterBuilderContext()
    // 渲出来就登记，在 setup 里同步做：首帧与服务端直出就带上名字
    ctx.labelCount.value++
    onUnmounted(() => {
      ctx.labelCount.value--
    })
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 组与条件部件上的 value 换成路径；树里没有这个节点是作者写错了。 */
function usePathOf(value: () => string, part: string): ComputedRef<FilterPath> {
  const ctx = useFilterBuilderContext()
  return computed(() => {
    const path = ctx.api.value.nodePath(value())
    if (!path)
      throw new Error(`[xh] ${part} 的 value「${value()}」不是条件树里的节点`)
    return path
  })
}

export const XhFilterBuilderGroup = defineComponent({
  name: 'XhFilterBuilderGroup',
  props: {
    /** 组的节点身份：视图里的 key。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useFilterBuilderContext()
    const path = usePathOf(() => props.value, 'XhFilterBuilderGroup')
    provideFilterBuilderGroup(path)
    return () => h('div', ctx.api.value.getGroupProps(path.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhFilterBuilderGroupHeader = defineComponent({
  name: 'XhFilterBuilderGroupHeader',
  setup(_, { slots }) {
    const ctx = useFilterBuilderContext()
    const path = useFilterBuilderGroup()
    return () => h('div', ctx.api.value.getGroupHeaderProps(path.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhFilterBuilderLogic = defineComponent({
  name: 'XhFilterBuilderLogic',
  setup(_, { slots }) {
    const ctx = useFilterBuilderContext()
    const path = useFilterBuilderGroup()
    return () => h('div', ctx.api.value.getLogicProps(path.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhFilterBuilderGroupDeleteTrigger = defineComponent({
  name: 'XhFilterBuilderGroupDeleteTrigger',
  setup(_, { slots }) {
    const ctx = useFilterBuilderContext()
    const path = useFilterBuilderGroup()
    return () => h('button', ctx.api.value.getGroupDeleteTriggerProps(path.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhFilterBuilderGroupItems = defineComponent({
  name: 'XhFilterBuilderGroupItems',
  setup(_, { slots }) {
    const ctx = useFilterBuilderContext()
    const path = useFilterBuilderGroup()
    return () => h('div', ctx.api.value.getGroupItemsProps(path.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhFilterBuilderGroupFooter = defineComponent({
  name: 'XhFilterBuilderGroupFooter',
  setup(_, { slots }) {
    const ctx = useFilterBuilderContext()
    const path = useFilterBuilderGroup()
    return () => h('div', ctx.api.value.getGroupFooterProps(path.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhFilterBuilderAddConditionTrigger = defineComponent({
  name: 'XhFilterBuilderAddConditionTrigger',
  setup(_, { slots }) {
    const ctx = useFilterBuilderContext()
    const path = useFilterBuilderGroup()
    return () => h('button', ctx.api.value.getAddConditionTriggerProps(path.value) as Record<string, unknown>, slots.default?.() ?? ctx.translations.value.addCondition)
  },
})

export const XhFilterBuilderAddGroupTrigger = defineComponent({
  name: 'XhFilterBuilderAddGroupTrigger',
  setup(_, { slots }) {
    const ctx = useFilterBuilderContext()
    const path = useFilterBuilderGroup()
    return () => h('button', ctx.api.value.getAddGroupTriggerProps(path.value) as Record<string, unknown>, slots.default?.() ?? ctx.translations.value.addGroup)
  },
})

export const XhFilterBuilderCondition = defineComponent({
  name: 'XhFilterBuilderCondition',
  props: {
    /** 条件的节点身份：视图里的 key。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useFilterBuilderContext()
    const path = usePathOf(() => props.value, 'XhFilterBuilderCondition')
    provideFilterBuilderCondition(path)
    return () => h('div', ctx.api.value.getConditionProps(path.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhFilterBuilderConditionField = defineComponent({
  name: 'XhFilterBuilderConditionField',
  setup(_, { slots }) {
    const ctx = useFilterBuilderContext()
    const path = useFilterBuilderCondition()
    return () => h('div', ctx.api.value.getConditionFieldProps(path.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhFilterBuilderConditionOperator = defineComponent({
  name: 'XhFilterBuilderConditionOperator',
  setup(_, { slots }) {
    const ctx = useFilterBuilderContext()
    const path = useFilterBuilderCondition()
    return () => h('div', ctx.api.value.getConditionOperatorProps(path.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhFilterBuilderConditionSource = defineComponent({
  name: 'XhFilterBuilderConditionSource',
  setup(_, { slots }) {
    const ctx = useFilterBuilderContext()
    const path = useFilterBuilderCondition()
    return () => h('div', ctx.api.value.getConditionSourceProps(path.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhFilterBuilderConditionOperand = defineComponent({
  name: 'XhFilterBuilderConditionOperand',
  setup(_, { slots }) {
    const ctx = useFilterBuilderContext()
    const path = useFilterBuilderCondition()
    return () => h('div', ctx.api.value.getConditionOperandProps(path.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhFilterBuilderConditionIgnoreCase = defineComponent({
  name: 'XhFilterBuilderConditionIgnoreCase',
  setup(_, { slots }) {
    const ctx = useFilterBuilderContext()
    const path = useFilterBuilderCondition()
    return () => h('div', ctx.api.value.getConditionIgnoreCaseProps(path.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhFilterBuilderConditionExtra = defineComponent({
  name: 'XhFilterBuilderConditionExtra',
  setup(_, { slots }) {
    const ctx = useFilterBuilderContext()
    const path = useFilterBuilderCondition()
    return () => h('div', ctx.api.value.getConditionExtraProps(path.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhFilterBuilderConditionDeleteTrigger = defineComponent({
  name: 'XhFilterBuilderConditionDeleteTrigger',
  setup(_, { slots }) {
    const ctx = useFilterBuilderContext()
    const path = useFilterBuilderCondition()
    return () => h('button', ctx.api.value.getConditionDeleteTriggerProps(path.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhFilterBuilderConditionError = defineComponent({
  name: 'XhFilterBuilderConditionError',
  setup(_, { slots }) {
    const ctx = useFilterBuilderContext()
    const path = useFilterBuilderCondition()
    return () => h('p', ctx.api.value.getConditionErrorProps(path.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhFilterBuilderRangeSeparator = defineComponent({
  name: 'XhFilterBuilderRangeSeparator',
  setup(_, { slots }) {
    const ctx = useFilterBuilderContext()
    return () => h('span', ctx.api.value.getRangeSeparatorProps() as Record<string, unknown>, slots.default?.() ?? ctx.translations.value.rangeSeparator)
  },
})

export const XhFilterBuilderEmpty = defineComponent({
  name: 'XhFilterBuilderEmpty',
  setup(_, { slots }) {
    const ctx = useFilterBuilderContext()
    return () => h('div', ctx.api.value.getEmptyProps() as Record<string, unknown>, slots.default?.() ?? ctx.translations.value.empty)
  },
})

export const XhFilterBuilderLiveRegion = defineComponent({
  name: 'XhFilterBuilderLiveRegion',
  setup() {
    const ctx = useFilterBuilderContext()
    return () => h('div', ctx.api.value.getLiveRegionProps() as Record<string, unknown>, ctx.api.value.announcement)
  },
})

/** 标准结构里各部件对应的组件。 */
const FILTER_BUILDER_PARTS = {
  'group': XhFilterBuilderGroup,
  'group-header': XhFilterBuilderGroupHeader,
  'logic': XhFilterBuilderLogic,
  'group-delete-trigger': XhFilterBuilderGroupDeleteTrigger,
  'group-items': XhFilterBuilderGroupItems,
  'group-footer': XhFilterBuilderGroupFooter,
  'add-condition-trigger': XhFilterBuilderAddConditionTrigger,
  'add-group-trigger': XhFilterBuilderAddGroupTrigger,
  'condition': XhFilterBuilderCondition,
  'condition-field': XhFilterBuilderConditionField,
  'condition-operator': XhFilterBuilderConditionOperator,
  'condition-source': XhFilterBuilderConditionSource,
  'condition-operand': XhFilterBuilderConditionOperand,
  'range-separator': XhFilterBuilderRangeSeparator,
  'condition-ignore-case': XhFilterBuilderConditionIgnoreCase,
  'condition-extra': XhFilterBuilderConditionExtra,
  'condition-delete-trigger': XhFilterBuilderConditionDeleteTrigger,
  'condition-error': XhFilterBuilderConditionError,
  'empty': XhFilterBuilderEmpty,
  'live-region': XhFilterBuilderLiveRegion,
}

/** 标准结构里组合进来的组件：与 Web Components 元素的 static dependencies 是同一份清单。 */
const FILTER_BUILDER_INSTANCES = {
  'date-field': XhDateFieldRoot,
  'number-field': XhNumberFieldRoot,
  'select': XhSelectRoot,
  'switch': XhSwitch,
  'tags-input': XhTagsInputRoot,
  'text-field': XhTextFieldRoot,
  'toggle-group': XhToggleGroupRoot,
}

/**
 * 未写默认插槽时铺开的整套结构：照 headless 的 filterBuilderStructure 渲，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 写了 condition-extra 插槽时，带 id 的条件行尾铺扩展位，内容交给插槽。
 */
function renderDefaultStructure(api: FilterBuilderApi, translations: FilterBuilderTranslations, extraSlot?: (props: FilterBuilderConditionExtraSlotProps) => VNode[]): VNode[] {
  const nodes = filterBuilderStructure(api, translations, { slotted: name => name === 'condition-extra' && extraSlot != null })
  return renderStructure(nodes, FILTER_BUILDER_PARTS, node =>
    node.slot?.name === 'condition-extra' ? extraSlot?.(node.data as FilterBuilderConditionExtraSlotProps) : undefined, FILTER_BUILDER_INSTANCES)
}
