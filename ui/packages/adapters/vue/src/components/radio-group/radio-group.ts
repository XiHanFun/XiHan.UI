/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 radio group 相关实现。

import type { Direction, Orientation, PropTypes, Size, Tone } from '@xihan-ui/core'
import type { RadioGroupApi, RadioGroupItemProps, RadioGroupNode, RadioGroupNodeMeta, RadioGroupSchema, RadioGroupValueChangeDetails, RadioGroupVariant, SelectionValueKey, StructureChild } from '@xihan-ui/headless'
import type { PropType, VNode } from 'vue'
import type { BivariantCallback } from '../../runtime/bivariant'
import { radioGroupStructure, valueKeyOf } from '@xihan-ui/headless'
import { computed, defineComponent, h, onBeforeUnmount, onUnmounted, ref, watch } from 'vue'
import { renderStructure } from '../../runtime/structure'
import { useFieldGroupWiring, useFieldLabelWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { provideRadioGroup, provideRadioGroupItem, useRadioGroupContext, useRadioGroupItemContext } from './context'
import { useRadioGroup } from './use-radio-group'

type RadioGroupProps = RadioGroupSchema['props']

// 运行时的根组件按 unknown 收值；对外导出的 XhRadioGroupRoot 在它上面套一层按值类型收窄的类型，见文件后面
const XhRadioGroupRootImpl = defineComponent({
  name: 'XhRadioGroupRoot',
  props: {
    /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
    ariaLabel: { type: String },
    collection: { type: Array as PropType<RadioGroupNode<unknown>[]> },
    /** 对象值怎样取键：字段名或取值函数；同一个选项每次都是新对象时给它，不给按对象身份认。 */
    valueKey: { type: [String, Function] as PropType<string | ((value: never) => string)> },
    /** 标题文字。提供后不必再写 label 部件；需要放置其他内容时改用 label 插槽。 */
    label: { type: String },
    // 值可以是字符串、数字或对象：运行时不查类型，类型由对外导出的 XhRadioGroupRoot 按值类型收窄
    value: { type: null as unknown as PropType<unknown> },
    defaultValue: { type: null as unknown as PropType<unknown> },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    orientation: { type: String as PropType<Orientation> },
    dir: { type: String as PropType<Direction> },
    name: { type: String },
    loop: { type: Boolean, default: undefined },
    block: { type: Boolean, default: undefined },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    variant: { type: String as PropType<RadioGroupVariant> },
  },
  // value-change 携带 { value }，update:value 携带裸值
  emits: {
    'value-change': (_details: RadioGroupValueChangeDetails<unknown>) => true,
    'update:value': (_value: unknown) => true,
  },
  setup(props, { slots, emit }) {
    const notify: RadioGroupProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useRadioGroup(useFormControlProps(props) as unknown as RadioGroupProps, notify)
    provideRadioGroup(ctx)
    // 放进表单字段时，字段的标题与说明接到组上：读屏进组时念组名与说明
    const fieldWiring = useFieldGroupWiring()
    const fieldLabel = useFieldLabelWiring()
    return () => {
      // 标题文字不论手写选项还是数据驱动都由根铺出：手写选项时不必再写 label 部件
      const title = slots.label?.() ?? (props.label != null ? [props.label] : null)
      return h(
        'div',
        { ...fieldLabel.value({ ...fieldWiring.value, ...ctx.api.value.getRootProps() as Record<string, unknown> }), ref: ctx.rootRef },
        slots.default
          ? [...renderLabel(title), ...slots.default()]
          : renderDefaultStructure(ctx.api.value, props.label, { label: slots.label, item: slots.item }),
      )
    }
  },
})

/** 根组件里随值类型收窄的那几项 prop：选中值、条目数据、取键方式与值变化的回调。 */
export interface XhRadioGroupRootValueProps<V> {
  'value'?: V | null
  'defaultValue'?: V | null
  'collection'?: RadioGroupNode<V>[]
  'valueKey'?: SelectionValueKey<V>
  'onUpdate:value'?: BivariantCallback<[value: V | null]>
  'onValueChange'?: BivariantCallback<[details: RadioGroupValueChangeDetails<V>]>
}

type XhRadioGroupRootInstance = InstanceType<typeof XhRadioGroupRootImpl>

/**
 * 按值类型收窄的根组件类型。模板里由 Volar 照 value / collection 推断 V：v-model:value 绑数字或对象都不必断言，
 * 条目插槽交出来的也是 V。`h()` 推断不了泛型，那里按 unknown 收。
 */
export type XhRadioGroupRootComponent = Omit<typeof XhRadioGroupRootImpl, never> & {
  new<V = string>(props?: Omit<XhRadioGroupRootInstance['$props'], keyof XhRadioGroupRootValueProps<V>> & XhRadioGroupRootValueProps<V>): Omit<XhRadioGroupRootInstance, '$props' | '$slots'> & {
    $props: Omit<XhRadioGroupRootInstance['$props'], keyof XhRadioGroupRootValueProps<V>> & XhRadioGroupRootValueProps<V>
    $slots: Omit<XhRadioGroupRootInstance['$slots'], 'item'> & {
      item?: (node: RadioGroupNodeMeta<V>) => VNode[]
    }
  }
}

export const XhRadioGroupRoot = XhRadioGroupRootImpl as unknown as XhRadioGroupRootComponent

export const XhRadioGroupLabel = defineComponent({
  name: 'XhRadioGroupLabel',
  setup(_, { slots }) {
    const ctx = useRadioGroupContext()
    // 渲出来就登记，在 setup 里同步做：排在条目之前时首帧与服务端直出就带上名字
    ctx.labelCount.value++
    onUnmounted(() => {
      ctx.labelCount.value--
    })
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

/** segmented 形态里滑动的选中标记，位置由状态机测量后写入内联样式的私有槽；没有落点时收起。须写在条目之前。 */
export const XhRadioGroupThumb = defineComponent({
  name: 'XhRadioGroupThumb',
  setup() {
    const ctx = useRadioGroupContext()
    return () => h('span', ctx.api.value.getThumbProps() as Record<string, unknown>)
  },
})

export const XhRadioGroupItem = defineComponent({
  name: 'XhRadioGroupItem',
  props: {
    /** 条目代表的值，与根上的值同类型：字符串、数字或对象。 */
    value: { type: null as unknown as PropType<unknown>, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useRadioGroupContext()
    const item = computed<RadioGroupItemProps<unknown>>(() => ({ value: props.value, disabled: props.disabled }))
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
        // 机器只认键
        svc.send({ type: 'ITEM.FOCUS', value: valueKeyOf(svc.scope, next) })
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

/** 条目文字前的图标位：纯装饰，对读屏隐藏。 */
export const XhRadioGroupItemIcon = defineComponent({
  name: 'XhRadioGroupItemIcon',
  setup(_, { slots }) {
    const ctx = useRadioGroupContext()
    const { item } = useRadioGroupItemContext()
    return () => h('span', ctx.api.value.getItemIconProps(item.value) as Record<string, unknown>, slots.default?.())
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

export const XhRadioGroupItemDescription = defineComponent({
  name: 'XhRadioGroupItemDescription',
  setup(_, { slots }) {
    const ctx = useRadioGroupContext()
    const { item } = useRadioGroupItemContext()
    return () => h('span', ctx.api.value.getItemDescriptionProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 标准结构里各部件对应的组件；条目里的表单影子与圆圈由 XhRadioGroupItem 自行装配，铺结构时去掉这两格。 */
const RADIO_GROUP_PARTS = {
  'label': XhRadioGroupLabel,
  'thumb': XhRadioGroupThumb,
  'item': XhRadioGroupItem,
  'item-icon': XhRadioGroupItemIcon,
  'item-text': XhRadioGroupItemText,
  'item-description': XhRadioGroupItemDescription,
}

const SELF_ASSEMBLED = new Set(['hidden-input', 'indicator'])

function withoutSelfAssembled(nodes: readonly StructureChild[]): StructureChild[] {
  return nodes.flatMap((node): StructureChild[] => {
    if (!('part' in node))
      return [node]
    if (SELF_ASSEMBLED.has(node.part))
      return []
    return [node.children ? { ...node, children: withoutSelfAssembled(node.children) } : node]
  })
}

interface RadioGroupStructureSlots {
  label?: () => VNode[]
  item?: (node: RadioGroupNodeMeta<unknown>) => VNode[]
}

/**
 * 未写默认插槽时铺开的整套结构：照 headless 的 radioGroupStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。标题与条目文字由对应插槽接管。
 */
function renderDefaultStructure(api: RadioGroupApi<PropTypes, unknown>, label: string | undefined, content: RadioGroupStructureSlots): VNode[] {
  const nodes = radioGroupStructure(api, { label, slotted: name => content[name as keyof RadioGroupStructureSlots] != null })
  return renderStructure(withoutSelfAssembled(nodes), RADIO_GROUP_PARTS, (node) => {
    switch (node.slot?.name) {
      case 'label':
        return content.label?.()
      case 'item':
        return content.item?.(node.data as RadioGroupNodeMeta<unknown>) ?? (node.data as RadioGroupNodeMeta<unknown>).label
      default:
        return undefined
    }
  })
}

/** 组标题：给了文字或 label 插槽才铺 label 部件。 */
function renderLabel(title: (VNode | string)[] | null): VNode[] {
  return title ? [h(XhRadioGroupLabel, null, () => title)] : []
}
