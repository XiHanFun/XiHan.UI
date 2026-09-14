/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color swatch picker 相关实现。

import type { Direction, Size, Tone } from '@xihan-ui/core'
import type { ColorSwatchPickerApi, ColorSwatchPickerItemProps, ColorSwatchPickerNode, ColorSwatchPickerNodeMeta, ColorSwatchPickerSchema } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { withXhConfig } from '../../config/config'
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
    /** 格子数据；不写默认插槽时按它自动铺开。 */
    swatches: { type: Array as PropType<ColorSwatchPickerNode[]> },
    /** 标题文字。给了它就不必再写 label 部件；要放别的内容改用 label 插槽。 */
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
    return () => {
      const api = ctx.api.value
      return h(
        'div',
        api.getRootProps() as Record<string, unknown>,
        slots.default
          ? slots.default({
              value: api.value,
              swatches: api.swatches,
              focusedValue: api.focusedValue,
              isSelected: api.isSelected,
              setValue: api.setValue,
            })
          : props.swatches
            ? renderDefaultTree(api.swatches, slots.label?.() ?? (props.label != null ? [props.label] : null))
            : [],
      )
    }
  },
})

export const XhColorSwatchPickerLabel = defineComponent({
  name: 'XhColorSwatchPickerLabel',
  setup(_, { slots }) {
    const ctx = useColorSwatchPickerContext()
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 一格：色块面、选中标记与表单影子由格子自行装配，不暴露成独立组件。 */
export const XhColorSwatchPickerItem = defineComponent({
  name: 'XhColorSwatchPickerItem',
  props: {
    value: { type: String, required: true },
    /** 读屏怎么念这一格；缺省交给 connect 回 swatches 里查，都没有就念颜色串。 */
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

/**
 * 没写默认插槽时按 swatches 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写默认插槽，行为不变。
 */
function renderDefaultTree(
  swatches: readonly ColorSwatchPickerNodeMeta[],
  label: (VNode | string)[] | null,
): VNode[] {
  return [
    ...(label ? [h(XhColorSwatchPickerLabel, null, () => label)] : []),
    ...swatches.map(node => h(XhColorSwatchPickerItem, { key: node.value, value: node.value })),
  ]
}
