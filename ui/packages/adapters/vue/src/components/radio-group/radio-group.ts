/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 radio group 相关实现。

import type { Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { RadioGroupItemProps, RadioGroupNode, RadioGroupNodeMeta, RadioGroupSchema, RadioGroupVariant } from '@xihan-ui/headless'
import type { PropType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useFormControlProps } from '../form/use-form-control'
import { provideRadioGroup, provideRadioGroupItem, useRadioGroupContext, useRadioGroupItemContext } from './context'
import { useRadioGroup } from './use-radio-group'

type RadioGroupProps = RadioGroupSchema['props']

export const XhRadioGroupRoot = defineComponent({
  name: 'XhRadioGroupRoot',
  props: {
    collection: { type: Array as PropType<RadioGroupNode[]> },
    /** 标题文字。提供后不必再写 label 部件；需要放置其他内容时改用 label 插槽。 */
    label: { type: String },
    value: { type: String as PropType<string | null> },
    defaultValue: { type: String as PropType<string | null> },
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
    'value-change': (_details: PayloadOf<RadioGroupProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<RadioGroupProps, 'onValueChange'>['value']) => true,
  },
  setup(props, { slots, emit }) {
    const notify: RadioGroupProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useRadioGroup(useFormControlProps(props) as RadioGroupProps, notify)
    provideRadioGroup(ctx)
    return () => {
      // 标题文字不论手写选项还是数据驱动都由根铺出：手写选项时不必再写 label 部件
      const title = slots.label?.() ?? (props.label != null ? [props.label] : null)
      return h(
        'div',
        { ...ctx.api.value.getRootProps() as Record<string, unknown>, ref: ctx.rootRef },
        slots.default
          ? [...renderLabel(title), ...slots.default()]
          : props.collection
            ? renderDefaultTree(
                ctx.api.value.collection,
                ctx.api.value.variant === 'segmented',
                title,
                slots.item,
              )
            : renderLabel(title),
      )
    }
  },
})

export const XhRadioGroupLabel = defineComponent({
  name: 'XhRadioGroupLabel',
  setup(_, { slots }) {
    const ctx = useRadioGroupContext()
    // 渲出来了才登记：根的 aria-labelledby 只在这个节点真在场时才指过来
    onMounted(() => {
      ctx.labelCount.value++
    })
    onBeforeUnmount(() => {
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
    value: { type: String, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
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

/**
 * 未写默认插槽时按 collection 铺开的整套结构，作者只提供数据。
 * 与手写部件产出的 DOM 完全一致，需要修改结构时写默认插槽，行为不变。
 * segmented 形态的滑块排在条目之前：它绝对定位，依靠文档序让后面的条目覆盖在它上面，文字才不会被遮住。
 */
function renderDefaultTree(
  collection: readonly RadioGroupNodeMeta[],
  segmented: boolean,
  label: (VNode | string)[] | null,
  itemSlot?: (node: RadioGroupNodeMeta) => VNode[],
): VNode[] {
  return [
    ...renderLabel(label),
    ...(segmented ? [h(XhRadioGroupThumb)] : []),
    // 条目内的 hidden-input 与 indicator 由 XhRadioGroupItem 自行装配
    ...collection.map(node => h(XhRadioGroupItem, { key: node.value, value: node.value }, () => [
      ...(node.icon != null ? [h(XhRadioGroupItemIcon, null, () => node.icon)] : []),
      h(XhRadioGroupItemText, null, () => itemSlot?.(node) ?? node.label),
      ...(node.description != null ? [h(XhRadioGroupItemDescription, null, () => node.description)] : []),
    ])),
  ]
}

/** 组标题：给了文字或 label 插槽才铺 label 部件。 */
function renderLabel(title: (VNode | string)[] | null): VNode[] {
  return title ? [h(XhRadioGroupLabel, null, () => title)] : []
}
