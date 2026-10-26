/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 checkbox group 相关实现。

import type { Orientation, PropTypes, Size, Tone } from '@xihan-ui/core'
import type {
  CheckboxGroupApi,
  CheckboxGroupItemProps,
  CheckboxGroupNode,
  CheckboxGroupNodeMeta,
  CheckboxGroupSchema,
  CheckboxGroupValueChangeDetails,
  CheckboxGroupVariant,
  SelectionValueKey,
  StructureChild,
} from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { BivariantCallback } from '../../runtime/bivariant'
import { checkboxGroupStructure } from '@xihan-ui/headless'
import { computed, defineComponent, h, onUnmounted } from 'vue'
import { renderStructure } from '../../runtime/structure'
import { useFieldGroupWiring, useFieldLabelWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import {
  provideCheckboxGroup,
  provideCheckboxGroupItem,
  useCheckboxGroupContext,
  useCheckboxGroupItemContext,
} from './context'
import { useCheckboxGroup } from './use-checkbox-group'

type CheckboxGroupProps = CheckboxGroupSchema['props']

/** 默认插槽的载荷：整组的选中集合与全选态，以及整体替换与翻转单值的方法。V 是选中值的类型。 */
export type CheckboxGroupRootSlotProps<V = string> = Pick<
  CheckboxGroupApi<PropTypes, V>,
  'value' | 'checkedState' | 'atMax' | 'atMin' | 'isChecked' | 'setValue' | 'toggleValue'
>

// 运行时的根组件按 unknown 收值；对外导出的 XhCheckboxGroupRoot 在它上面套一层按值类型收窄的类型，见文件后面
const XhCheckboxGroupRootImpl = defineComponent({
  name: 'XhCheckboxGroupRoot',
  props: {
    /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
    ariaLabel: { type: String },
    collection: { type: Array as PropType<CheckboxGroupNode<unknown>[]> },
    /** 对象值怎样取键：字段名或取值函数；同一个选项每次都是新对象时给它，不给按对象身份认。 */
    valueKey: { type: [String, Function] as PropType<string | ((value: never) => string)> },
    /** 标题文字。提供后不必再写 label 部件；需要放置其他内容时改用 label 插槽。 */
    label: { type: String },
    // 缺席值 undefined 表示非受控
    // 值可以是字符串、数字或对象：类型由对外导出的 XhCheckboxGroupRoot 按值类型收窄
    value: { type: Array as PropType<unknown[]> },
    defaultValue: { type: Array as PropType<unknown[]> },
    itemValues: { type: Array as PropType<unknown[]> },
    min: { type: Number },
    max: { type: Number },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    name: { type: String },
    orientation: { type: String as PropType<Orientation> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    variant: { type: String as PropType<CheckboxGroupVariant> },
  },
  // value-change 携带 { value }，update:value 携带裸数组
  emits: {
    'value-change': (_details: CheckboxGroupValueChangeDetails<unknown>) => true,
    'update:value': (_value: unknown[]) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: CheckboxGroupRootSlotProps<unknown>) => VNode[]
    label?: () => VNode[]
    item?: (props: CheckboxGroupNodeMeta<unknown>) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: CheckboxGroupProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useCheckboxGroup(useFormControlProps(props) as unknown as CheckboxGroupProps, notify)
    provideCheckboxGroup(ctx)
    // 放进表单字段时，字段的标题与说明接到组上：读屏进组时念组名与说明
    const fieldWiring = useFieldGroupWiring()
    const fieldLabel = useFieldLabelWiring()
    return () => {
      // 标题文字不论手写选项还是数据驱动都由根铺出：手写选项时不必再写 label 部件
      const title = slots.label?.() ?? (props.label != null ? [props.label] : null)
      return h('div', fieldLabel.value({ ...fieldWiring.value, ...ctx.api.value.getRootProps() }), slots.default
        ? [...renderLabel(title), ...slots.default({
            value: ctx.api.value.value,
            checkedState: ctx.api.value.checkedState,
            atMax: ctx.api.value.atMax,
            atMin: ctx.api.value.atMin,
            isChecked: ctx.api.value.isChecked,
            setValue: ctx.api.value.setValue,
            toggleValue: ctx.api.value.toggleValue,
          })]
        : renderDefaultStructure(ctx.api.value, props.label, { label: slots.label, item: slots.item }))
    }
  },
})

/** 根组件里随值类型收窄的那几项 prop：选中值、条目数据、全部条目的值、取键方式与值变化的回调。 */
export interface XhCheckboxGroupRootValueProps<V> {
  'value'?: V[]
  'defaultValue'?: V[]
  'itemValues'?: V[]
  'collection'?: CheckboxGroupNode<V>[]
  'valueKey'?: SelectionValueKey<V>
  'onUpdate:value'?: BivariantCallback<[value: V[]]>
  'onValueChange'?: BivariantCallback<[details: CheckboxGroupValueChangeDetails<V>]>
}

type XhCheckboxGroupRootInstance = InstanceType<typeof XhCheckboxGroupRootImpl>

/**
 * 按值类型收窄的根组件类型。模板里由 Volar 照 value / collection 推断 V：v-model:value 绑数字或对象的数组都不必断言，
 * 默认插槽与条目插槽交出来的也是 V。`h()` 推断不了泛型，那里按 unknown 收。
 */
export type XhCheckboxGroupRootComponent = Omit<typeof XhCheckboxGroupRootImpl, never> & {
  new<V = string>(props?: Omit<XhCheckboxGroupRootInstance['$props'], keyof XhCheckboxGroupRootValueProps<V>> & XhCheckboxGroupRootValueProps<V>): Omit<XhCheckboxGroupRootInstance, '$props' | '$slots'> & {
    $props: Omit<XhCheckboxGroupRootInstance['$props'], keyof XhCheckboxGroupRootValueProps<V>> & XhCheckboxGroupRootValueProps<V>
    $slots: Omit<XhCheckboxGroupRootInstance['$slots'], 'default' | 'item'> & {
      default?: (props: CheckboxGroupRootSlotProps<V>) => VNode[]
      item?: (node: CheckboxGroupNodeMeta<V>) => VNode[]
    }
  }
}

export const XhCheckboxGroupRoot = XhCheckboxGroupRootImpl as unknown as XhCheckboxGroupRootComponent

export const XhCheckboxGroupLabel = defineComponent({
  name: 'XhCheckboxGroupLabel',
  setup(_, { slots }) {
    const ctx = useCheckboxGroupContext()
    // 渲出来就登记，在 setup 里同步做：排在条目之前时首帧与服务端直出就带上名字
    ctx.labelCount.value++
    onUnmounted(() => {
      ctx.labelCount.value--
    })
    return () => h('span', ctx.api.value.getLabelProps(), slots.default?.())
  },
})

export const XhCheckboxGroupItem = defineComponent({
  name: 'XhCheckboxGroupItem',
  props: {
    /** 条目代表的值，与根上的值同类型：字符串、数字或对象。 */
    value: { type: null as unknown as PropType<unknown>, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useCheckboxGroupContext()
    const item = computed<CheckboxGroupItemProps<unknown>>(() => ({ value: props.value, disabled: props.disabled }))
    provideCheckboxGroupItem({ item })
    // 表单影子由条目自行装配，不暴露成独立组件，作者只写方框与文本
    return () => h('div', ctx.api.value.getItemProps(item.value), [
      h('input', ctx.api.value.getHiddenInputProps(item.value)),
      ...(slots.default?.() ?? []),
    ])
  },
})

export const XhCheckboxGroupIndicator = defineComponent({
  name: 'XhCheckboxGroupIndicator',
  setup(_, { slots }) {
    const ctx = useCheckboxGroupContext()
    const { item } = useCheckboxGroupItemContext()
    // 插槽留给作者放对勾图形，方框本身对读屏隐藏
    return () => h('span', ctx.api.value.getIndicatorProps(item.value), slots.default?.())
  },
})

export const XhCheckboxGroupItemText = defineComponent({
  name: 'XhCheckboxGroupItemText',
  setup(_, { slots }) {
    const ctx = useCheckboxGroupContext()
    const { item } = useCheckboxGroupItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value), slots.default?.())
  },
})

export const XhCheckboxGroupItemDescription = defineComponent({
  name: 'XhCheckboxGroupItemDescription',
  setup(_, { slots }) {
    const ctx = useCheckboxGroupContext()
    const { item } = useCheckboxGroupItemContext()
    return () => h('span', ctx.api.value.getItemDescriptionProps(item.value), slots.default?.())
  },
})

export const XhCheckboxGroupSelectAllTrigger = defineComponent({
  name: 'XhCheckboxGroupSelectAllTrigger',
  setup(_, { slots }) {
    const ctx = useCheckboxGroupContext()
    // 与条目同形的 role=checkbox 节点，渲染为 div，Space 由 connect 接管
    return () => h('div', ctx.api.value.getSelectAllTriggerProps(), slots.default?.())
  },
})

/** 标准结构里各部件对应的组件；条目里的表单影子由 XhCheckboxGroupItem 自行装配，铺结构时去掉这一格。 */
const CHECKBOX_GROUP_PARTS = {
  'label': XhCheckboxGroupLabel,
  'item': XhCheckboxGroupItem,
  'indicator': XhCheckboxGroupIndicator,
  'item-text': XhCheckboxGroupItemText,
  'item-description': XhCheckboxGroupItemDescription,
}

function withoutSelfAssembled(nodes: readonly StructureChild[]): StructureChild[] {
  return nodes.flatMap((node): StructureChild[] => {
    if (!('part' in node))
      return [node]
    if (node.part === 'hidden-input')
      return []
    return [node.children ? { ...node, children: withoutSelfAssembled(node.children) } : node]
  })
}

interface CheckboxGroupStructureSlots {
  label?: () => VNode[]
  item?: (node: CheckboxGroupNodeMeta<unknown>) => VNode[]
}

/**
 * 未写默认插槽时铺开的整套结构：照 headless 的 checkboxGroupStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。标题与条目文字由对应插槽接管；全选控件要用时写默认插槽。
 */
function renderDefaultStructure(api: CheckboxGroupApi<PropTypes, unknown>, label: string | undefined, content: CheckboxGroupStructureSlots): VNode[] {
  const nodes = checkboxGroupStructure(api, { label, slotted: name => content[name as keyof CheckboxGroupStructureSlots] != null })
  return renderStructure(withoutSelfAssembled(nodes), CHECKBOX_GROUP_PARTS, (node) => {
    switch (node.slot?.name) {
      case 'label':
        return content.label?.()
      case 'item':
        return content.item?.(node.data as CheckboxGroupNodeMeta<unknown>) ?? (node.data as CheckboxGroupNodeMeta<unknown>).label
      default:
        return undefined
    }
  })
}

/** 组标题：给了文字或 label 插槽才铺 label 部件。 */
function renderLabel(title: (VNode | string)[] | null): VNode[] {
  return title ? [h(XhCheckboxGroupLabel, null, () => title)] : []
}
