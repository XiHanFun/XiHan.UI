/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color swatch picker 相关实现。

import type { Direction, Size, Tone } from '@xihan-ui/core'
import type { ColorSwatchPickerApi, ColorSwatchPickerItemProps, ColorSwatchPickerNode, ColorSwatchPickerSchema, StructureChild } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { colorSwatchPickerStructure } from '@xihan-ui/headless'
import { computed, defineComponent, h, onBeforeUnmount, onUnmounted, ref, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { renderStructure } from '../../runtime/structure'
import { useFieldGroupWiring, useFieldLabelWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { provideColorSwatchPicker, useColorSwatchPickerContext } from './context'
import { useColorSwatchPicker } from './use-color-swatch-picker'

type ColorSwatchPickerProps = ColorSwatchPickerSchema['props']

export type ColorSwatchPickerRootSlotProps = Pick<
  ColorSwatchPickerApi,
  'value' | 'swatches' | 'focusedValue' | 'isSelected' | 'setValue'
>

export const XhColorSwatchPickerRoot = defineComponent({
  name: 'XhColorSwatchPickerRoot',
  props: {
    /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
    ariaLabel: { type: String },
    /** 格子数据；未写默认插槽时按它自动铺开。 */
    swatches: { type: Array as PropType<ColorSwatchPickerNode[]> },
    /** 标题文字。提供后不必再写 label 部件；需要放置其他内容时改用 label 插槽。 */
    label: { type: String },
    value: { type: String as PropType<string | null> },
    defaultValue: { type: String as PropType<string | null> },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction> },
    name: { type: String },
    size: { type: String as PropType<Size> },
    tone: { type: String as PropType<Tone> },
    translations: { type: Object as PropType<ColorSwatchPickerProps['translations']> },
  },
  // value-change 携带 { value }，update:value 携带裸值
  emits: {
    'value-change': (_details: PayloadOf<ColorSwatchPickerProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<ColorSwatchPickerProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: ColorSwatchPickerRootSlotProps) => VNode[]
    label?: () => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: ColorSwatchPickerProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    // withXhConfig 只能在 setup 期调，机器在运行期读这份代理
    const ctx = useColorSwatchPicker(withXhConfig('color-swatch-picker', useFormControlProps(props)) as ColorSwatchPickerProps, notify)
    provideColorSwatchPicker(ctx)
    // 放进表单字段时，字段的标题与说明接到组上：读屏进组时念组名与说明
    const fieldWiring = useFieldGroupWiring()
    const fieldLabel = useFieldLabelWiring()
    return () => {
      const api = ctx.api.value
      // 标题文字不论手写格子还是数据驱动都由根铺出：手写格子时不必再写 label 部件
      const title = slots.label?.() ?? (props.label != null ? [props.label] : null)
      return h(
        'div',
        fieldLabel.value({ ...fieldWiring.value, ...api.getRootProps() as Record<string, unknown> }),
        slots.default
          ? [...renderLabel(title), ...slots.default({
              value: api.value,
              swatches: api.swatches,
              focusedValue: api.focusedValue,
              isSelected: api.isSelected,
              setValue: api.setValue,
            })]
          : renderDefaultStructure(api, props.label, slots.label),
      )
    }
  },
})

export const XhColorSwatchPickerLabel = defineComponent({
  name: 'XhColorSwatchPickerLabel',
  setup(_, { slots }) {
    const ctx = useColorSwatchPickerContext()
    // 渲出来就登记，在 setup 里同步做：排在条目之前时首帧与服务端直出就带上名字
    ctx.labelCount.value++
    onUnmounted(() => {
      ctx.labelCount.value--
    })
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 一格：色块面、选中标记与表单影子由格子自行装配，不暴露成独立组件。 */
export const XhColorSwatchPickerItem = defineComponent({
  name: 'XhColorSwatchPickerItem',
  props: {
    value: { type: String, required: true },
    /** 读屏朗读该格子的方式；默认交给 connect 查询 swatches，都没有时朗读颜色串。 */
    label: { type: String },
    // 缺省交给 connect 回 swatches 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useColorSwatchPickerContext()
    const item = computed<ColorSwatchPickerItemProps>(() => ({ value: props.value, label: props.label, disabled: props.disabled }))
    // 本格持有焦点时，value 变更重报焦点格，卸载时上报整组失焦
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
    return () => h('div', { ...ctx.api.value.getItemProps(item.value) as Record<string, unknown>, ref: itemEl }, [
      h('input', ctx.api.value.getHiddenInputProps(item.value) as Record<string, unknown>),
      h('span', ctx.api.value.getSwatchProps(item.value) as Record<string, unknown>),
      h('span', ctx.api.value.getIndicatorProps(item.value) as Record<string, unknown>),
      ...(slots.default?.() ?? []),
    ])
  },
})

/** 标准结构里各部件对应的组件。 */
const COLOR_SWATCH_PICKER_PARTS = {
  label: XhColorSwatchPickerLabel,
  item: XhColorSwatchPickerItem,
}

/** 格子自己装配表单影子、色块面与选中标记：铺结构时去掉这几格。 */
const SELF_ASSEMBLED: ReadonlySet<string> = new Set(['hidden-input', 'swatch', 'indicator'])

function withoutSelfAssembled(nodes: readonly StructureChild[]): StructureChild[] {
  return nodes.flatMap((node): StructureChild[] => {
    if (!('part' in node))
      return [node]
    if (SELF_ASSEMBLED.has(node.part))
      return []
    return [node.children ? { ...node, children: withoutSelfAssembled(node.children) } : node]
  })
}

/**
 * 未写默认插槽时铺开的整套结构，作者只提供数据：照 headless 的 colorSwatchPickerStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。标题由 label 插槽接管。
 */
function renderDefaultStructure(api: ColorSwatchPickerApi, label: string | undefined, labelSlot?: () => VNode[]): VNode[] {
  const nodes = colorSwatchPickerStructure(api, { label, slotted: name => name === 'label' && labelSlot != null })
  return renderStructure(withoutSelfAssembled(nodes), COLOR_SWATCH_PICKER_PARTS, node => (node.slot ? labelSlot?.() : undefined))
}

/** 组标题：给了文字或 label 插槽才铺 label 部件。 */
function renderLabel(title: (VNode | string)[] | null): VNode[] {
  return title ? [h(XhColorSwatchPickerLabel, null, () => title)] : []
}
