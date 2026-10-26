/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 format input 相关实现。

import type { ControlVariant, Size } from '@xihan-ui/core'
import type { FormatSpec } from '@xihan-ui/expression'
import type { FormatInputApi, FormatInputKind, FormatInputOption, FormatInputSchema, FormatInputTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { formatInputItemLabelTag, formatInputItemTag, formatInputStructure } from '@xihan-ui/headless'
import { defineComponent, h, onUnmounted } from 'vue'
import { withXhConfig } from '../../config/config'
import { renderStructure } from '../../runtime/structure'
import { XhComboboxRoot } from '../combobox/combobox'
import { useFieldGroupWiring, useFieldLabelWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { XhNumberFieldRoot } from '../number-field/number-field'
import { XhSelectRoot } from '../select/select'
import { XhSwitch } from '../switch/switch'
import { XhToggleGroupRoot } from '../toggle-group/toggle-group'
import { provideFormatInput, useFormatInputContext } from './context'
import { useFormatInput } from './use-format-input'

type FormatInputProps = FormatInputSchema['props']

/** 默认插槽的载荷：当前值、草稿、问题与改参数的方法。 */
export type FormatInputRootSlotProps = Pick<
  FormatInputApi,
  'value' | 'kind' | 'draft' | 'issue' | 'issueText' | 'previewText' | 'options' | 'kindItems' | 'kindControl' | 'setKind' | 'setDecimalsMode' | 'setDecimals' | 'setGrouping' | 'setRounding' | 'setPattern' | 'setNumeralStyle'
>

export const XhFormatInputRoot = defineComponent({
  name: 'XhFormatInputRoot',
  props: {
    /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
    ariaLabel: { type: String },
    // 缺席值 undefined 表示非受控；null 表示不设格式
    value: { type: Object as PropType<FormatSpec | null> },
    defaultValue: { type: Object as PropType<FormatSpec | null> },
    kinds: { type: Array as PropType<readonly FormatInputKind[]> },
    // undefined 才表示「本实例没说」，缺省 true
    clearable: { type: Boolean, default: undefined },
    /** 几个对象的取值各不相同：种类一项都不选、下拉显示「多个值」，选了种类即派发。 */
    mixed: { type: Boolean, default: undefined },
    datePatterns: { type: Array as PropType<readonly string[]> },
    sample: { type: null as unknown as PropType<unknown> },
    locale: { type: String },
    timeZone: { type: String },
    // undefined 才表示「本实例没说」，Form/Field 才能安全地下传状态；false 是显式顶掉继承。
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    variant: { type: String as PropType<ControlVariant> },
    size: { type: String as PropType<Size> },
    translations: { type: Object as PropType<FormatInputProps['translations']> },
  },
  // value-change 携带 { value }，update:value 携带格式说明本身
  emits: {
    'value-change': (_details: PayloadOf<FormatInputProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<FormatInputProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: FormatInputRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: FormatInputProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useFormatInput(withXhConfig('format-input', useFormControlProps(props)) as FormatInputProps, notify)
    provideFormatInput(ctx)
    // 放进表单字段时，字段的标题与说明接到组上：读屏进组时念组名与说明
    const fieldWiring = useFieldGroupWiring()
    const fieldLabel = useFieldLabelWiring()
    return () => {
      const api = ctx.api.value
      return h('div', fieldLabel.value({ ...fieldWiring.value, ...api.getRootProps() }), slots.default
        ? slots.default({
            value: api.value,
            kind: api.kind,
            draft: api.draft,
            issue: api.issue,
            issueText: api.issueText,
            previewText: api.previewText,
            options: api.options,
            kindItems: api.kindItems,
            kindControl: api.kindControl,
            setKind: api.setKind,
            setDecimalsMode: api.setDecimalsMode,
            setDecimals: api.setDecimals,
            setGrouping: api.setGrouping,
            setRounding: api.setRounding,
            setPattern: api.setPattern,
            setNumeralStyle: api.setNumeralStyle,
          })
        : renderDefaultStructure(api, ctx.translations.value))
    }
  },
})

export const XhFormatInputLabel = defineComponent({
  name: 'XhFormatInputLabel',
  setup(_, { slots }) {
    const ctx = useFormatInputContext()
    // 渲出来就登记，在 setup 里同步做：首帧与服务端直出就带上名字
    ctx.labelCount.value++
    onUnmounted(() => {
      ctx.labelCount.value--
    })
    return () => h('span', ctx.api.value.getLabelProps(), slots.default?.())
  },
})

export const XhFormatInputKind = defineComponent({
  name: 'XhFormatInputKind',
  setup(_, { slots }) {
    const ctx = useFormatInputContext()
    // 分段切换时是 fieldset（名字在 legend），下拉时是 div
    return () => h(formatInputItemTag('kind', ctx.api.value.kindControl), ctx.api.value.getKindProps(), slots.default?.())
  },
})

export const XhFormatInputFieldGroup = defineComponent({
  name: 'XhFormatInputFieldGroup',
  setup(_, { slots }) {
    const ctx = useFormatInputContext()
    return () => h('div', ctx.api.value.getFieldGroupProps(), slots.default?.())
  },
})

export const XhFormatInputItem = defineComponent({
  name: 'XhFormatInputItem',
  props: {
    /** 参数名：decimals-mode、decimals、min-decimals、max-decimals、grouping、rounding、pattern、numeral-style。 */
    value: { type: String as PropType<FormatInputOption>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useFormatInputContext()
    // 分段切换那一行是 fieldset、开关那一行是 label，其余是 div
    return () => h(formatInputItemTag(props.value, ctx.api.value.kindControl), ctx.api.value.getItemProps(props.value), slots.default?.())
  },
})

export const XhFormatInputItemLabel = defineComponent({
  name: 'XhFormatInputItemLabel',
  props: {
    /** 名字所属的那一行：参数名，或 kind。 */
    value: { type: String as PropType<FormatInputOption | 'kind'>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useFormatInputContext()
    // 在 fieldset 里是 legend，其余是 span
    return () => h(formatInputItemLabelTag(props.value, ctx.api.value.kindControl), ctx.api.value.getItemLabelProps(props.value), slots.default?.())
  },
})

export const XhFormatInputPatternDescription = defineComponent({
  name: 'XhFormatInputPatternDescription',
  setup(_, { slots }) {
    const ctx = useFormatInputContext()
    return () => h('p', ctx.api.value.getPatternDescriptionProps(), slots.default?.())
  },
})

export const XhFormatInputPreview = defineComponent({
  name: 'XhFormatInputPreview',
  setup(_, { slots }) {
    const ctx = useFormatInputContext()
    return () => h('div', ctx.api.value.getPreviewProps(), slots.default?.() ?? ctx.api.value.previewText)
  },
})

export const XhFormatInputErrorText = defineComponent({
  name: 'XhFormatInputErrorText',
  setup(_, { slots }) {
    const ctx = useFormatInputContext()
    return () => h('p', ctx.api.value.getErrorTextProps(), slots.default?.() ?? ctx.api.value.issueText)
  },
})

/** 标准结构里各部件对应的组件。 */
const FORMAT_INPUT_PARTS = {
  'kind': XhFormatInputKind,
  'field-group': XhFormatInputFieldGroup,
  'item': XhFormatInputItem,
  'item-label': XhFormatInputItemLabel,
  'pattern-description': XhFormatInputPatternDescription,
  'preview': XhFormatInputPreview,
  'error-text': XhFormatInputErrorText,
}

/** 标准结构里组合进来的组件：与 Web Components 元素的 static dependencies 是同一份清单。 */
const FORMAT_INPUT_INSTANCES = {
  'combobox': XhComboboxRoot,
  'number-field': XhNumberFieldRoot,
  'select': XhSelectRoot,
  'switch': XhSwitch,
  'toggle-group': XhToggleGroupRoot,
}

/** 未写默认插槽时铺开的整套结构：照 headless 的 formatInputStructure 渲，与 Web Components 不写部件时元素生成的节点出自同一份。 */
function renderDefaultStructure(api: FormatInputApi, translations: FormatInputTranslations): VNode[] {
  return renderStructure(formatInputStructure(api, translations), FORMAT_INPUT_PARTS, undefined, FORMAT_INPUT_INSTANCES)
}
