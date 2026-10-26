/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 checkbox 相关实现。

import type { Size, Tone } from '@xihan-ui/core'
import type { CheckboxApi, CheckboxCheckedState, CheckboxSchema } from '@xihan-ui/headless'
import type { InjectionKey, PropType, Ref, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { checkboxStructure } from '@xihan-ui/headless'
import { defineComponent, h, inject, provide, useId } from 'vue'
import { slotPaints } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { useCheckbox } from './use-checkbox'

type CheckboxProps = CheckboxSchema['props']

const CHECKBOX_API: InjectionKey<Readonly<Ref<CheckboxApi>>> = Symbol('XhCheckboxApi')

function useCheckboxApi(): Readonly<Ref<CheckboxApi>> {
  const api = inject(CHECKBOX_API)
  if (!api)
    throw new Error('[xh] 复选框的部件只能渲在 XhCheckbox 里')
  return api
}

/** 勾选标记：作者给了 indicator 插槽时装它的内容，没给时由皮肤画勾。 */
const CheckboxIndicator = defineComponent({
  name: 'XhCheckboxIndicator',
  setup(_, { slots }) {
    const api = useCheckboxApi()
    return () => h('span', api.value.getIndicatorProps(), slots.default?.())
  },
})

/** 表单影子：单体控件的方框里没有子部件插槽，作者递不进来，由组件自己渲。 */
const CheckboxHiddenInput = defineComponent({
  name: 'XhCheckboxHiddenInput',
  setup() {
    const api = useCheckboxApi()
    return () => h('input', api.value.getHiddenInputProps())
  },
})

/** 标准结构里各部件对应的组件。 */
const CHECKBOX_PARTS = {
  'indicator': CheckboxIndicator,
  'hidden-input': CheckboxHiddenInput,
}

export const XhCheckbox = defineComponent({
  name: 'XhCheckbox',
  props: {
    /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
    ariaLabel: { type: String },
    // 三态：true / false / 'indeterminate'。半选只能由外部给，点击不会切进去
    checked: { type: [Boolean, String] as PropType<CheckboxCheckedState>, default: undefined },
    defaultChecked: { type: [Boolean, String] as PropType<CheckboxCheckedState>, default: undefined },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    /** 表单字段名；提供后 hidden-input 才带 name 并参与提交 */
    name: { type: String },
    value: { type: String },
    tone: String as PropType<Tone>,
    size: String as PropType<Size>,
  },
  slots: Object as SlotsType<{
    /** 方框旁的文字；未写时只有一个方框。 */
    default?: () => VNode[]
    /** 方框中的图形；未写时由皮肤绘制勾选标记。 */
    indicator?: () => VNode[]
  }>,
  // checked-change 携带 { checked }，update:checked 携带裸布尔
  emits: {
    'checked-change': (_details: PayloadOf<CheckboxProps, 'onCheckedChange'>) => true,
    'update:checked': (_checked: PayloadOf<CheckboxProps, 'onCheckedChange'>['checked']) => true,
  },
  setup(props, { emit, slots }) {
    const notify: CheckboxProps['onCheckedChange'] = (details) => {
      emit('checked-change', details)
      emit('update:checked', details.checked)
    }
    const { api } = useCheckbox(useFormControlProps(props) as CheckboxProps, notify)
    provide(CHECKBOX_API, api)
    // 字段的说明与校验状态要落在焦点所在的那颗按钮上：给了文字时封装根是外面那个 <label>，
    // XhFieldControl 把整份接线合在它身上，而读屏只念焦点所在节点的描述
    const fieldWiring = useFieldStateWiring()
    // 字段的标签也得并进名字链，否则按钮的名字里只剩组件自己那段文字
    const fieldLabel = useFieldLabelWiring()
    // 文字那段的 id：按钮按它取名，字段的标签再排到它前面
    const textId = useId()
    // 表单影子由组件自己渲染，给了 name 才有这个节点——type=hidden 不是交互内容，放进 button 里是合法的
    return () => {
      // 默认插槽是方框旁的文字：<label> 包住两者，点文字即切换。没给文字就只有方框
      const text = slots.default?.()
      const labelled = slotPaints(text)
      const box = h('button', fieldLabel.value({
        ...fieldWiring.value,
        ...api.value.getRootProps(),
        // 有文字时名字改由它承担；没文字时不写，作者写在组件上的 aria-label 照旧生效
        ...(labelled ? { 'aria-labelledby': textId } : null),
      }), renderStructure(
        checkboxStructure({ hiddenInput: props.name !== undefined, slotted: name => name === 'indicator' && slots.indicator !== undefined }),
        CHECKBOX_PARTS,
        node => (node.slot?.name === 'indicator' ? slots.indicator?.() : undefined),
      ))
      if (!labelled)
        return box
      return h('label', api.value.getLabelProps(), [
        box,
        h('span', { ...api.value.getTextProps(), id: textId }, text),
      ])
    }
  },
})
