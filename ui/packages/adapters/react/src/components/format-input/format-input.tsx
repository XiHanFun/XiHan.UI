/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 format input 相关实现。

import type { ControlVariant, Size } from '@xihan-ui/core'
import type { FormatSpec } from '@xihan-ui/expression'
import type { FormatInputApi, FormatInputKind, FormatInputOption, FormatInputSchema, FormatInputTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { formatInputItemLabelTag, formatInputItemTag, formatInputStructure } from '@xihan-ui/headless'
import { createElement, useEffect } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { XhComboboxRoot } from '../combobox/combobox'
import { useFieldGroupWiring, useFieldLabelWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { XhNumberFieldRoot } from '../number-field/number-field'
import { XhSelectRoot } from '../select/select'
import { XhSwitch } from '../switch/switch'
import { XhToggleGroupRoot } from '../toggle-group/toggle-group'
import { FormatInputProvider, useFormatInputContext } from './context'
import { useFormatInput } from './use-format-input'

type FormatInputProps = FormatInputSchema['props']

/** 函数式 children 的载荷：当前值、草稿、问题与改参数的方法。 */
export type FormatInputRootSlotProps = Pick<
  FormatInputApi,
  'value' | 'kind' | 'draft' | 'issue' | 'issueText' | 'previewText' | 'options' | 'kindItems' | 'kindControl' | 'setKind' | 'setDecimalsMode' | 'setDecimals' | 'setGrouping' | 'setRounding' | 'setPattern' | 'setNumeralStyle'
>

export interface XhFormatInputRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue'> {
  /** 受控的格式说明；null 表示不设格式，undefined 表示非受控。 */
  value?: FormatSpec | null
  defaultValue?: FormatSpec | null
  /** 可选的种类，缺省全部。 */
  kinds?: readonly FormatInputKind[]
  /** 种类里多一项「不设格式」，缺省 true。 */
  clearable?: boolean
  /** 日期模式的预设。 */
  datePatterns?: readonly string[]
  /** 样例的输入值；缺省按种类取。 */
  sample?: unknown
  locale?: string
  timeZone?: string
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  variant?: ControlVariant
  size?: Size
  translations?: FormatInputProps['translations']
  onValueChange?: FormatInputProps['onValueChange']
  children?: SlotChildren<FormatInputRootSlotProps>
}

export function XhFormatInputRoot({
  value,
  defaultValue,
  kinds,
  clearable,
  datePatterns,
  sample,
  locale,
  timeZone,
  disabled,
  readOnly,
  invalid,
  variant,
  size,
  translations,
  onValueChange,
  children,
  ...rest
}: XhFormatInputRootProps): ReactNode {
  const ctx = useFormatInput(withXhConfig('format-input', useFormControlProps({
    value,
    defaultValue,
    kinds,
    clearable,
    datePatterns,
    sample,
    locale,
    timeZone,
    disabled,
    readOnly,
    invalid,
    variant,
    size,
    translations,
    onValueChange,
  })) as FormatInputProps)
  // 放进表单字段时，字段的标题与说明接到组上：读屏进组时念组名与说明
  const fieldWiring = useFieldGroupWiring()
  const fieldLabel = useFieldLabelWiring()
  const api = ctx.api
  return (
    <FormatInputProvider value={ctx}>
      <div {...mergeReactProps(fieldLabel({ ...fieldWiring, ...api.getRootProps() as Record<string, unknown> }), rest as Record<string, unknown>)}>
        {children != null
          ? renderSlot(children, {
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
          : renderDefaultStructure(api, ctx.translations)}
      </div>
    </FormatInputProvider>
  )
}

XhFormatInputRoot.xhEvents = ['value-change'] as const

export interface XhFormatInputLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhFormatInputLabel({ children, ...rest }: XhFormatInputLabelProps): ReactNode {
  const ctx = useFormatInputContext()
  // 渲出来了才登记：根的 aria-labelledby 只在这个节点真在场时才指过来
  const { registerLabel } = ctx
  useEffect(() => registerLabel(), [registerLabel])
  return <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhFormatInputKindProps extends ComponentPropsWithRef<'div'> {}
/** 种类控件的外包：分段切换时是 fieldset（名字在 legend），下拉时是 div。 */
export function XhFormatInputKind({ children, ...rest }: XhFormatInputKindProps): ReactNode {
  const ctx = useFormatInputContext()
  return createElement(formatInputItemTag('kind', ctx.api.kindControl), mergeReactProps(ctx.api.getKindProps() as Record<string, unknown>, rest as Record<string, unknown>), children)
}

export interface XhFormatInputFieldGroupProps extends ComponentPropsWithRef<'div'> {}
export function XhFormatInputFieldGroup({ children, ...rest }: XhFormatInputFieldGroupProps): ReactNode {
  const ctx = useFormatInputContext()
  return <div {...mergeReactProps(ctx.api.getFieldGroupProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhFormatInputItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** 参数名：decimals-mode、decimals、min-decimals、max-decimals、grouping、rounding、pattern、numeral-style。 */
  value: FormatInputOption
}
/** 一个参数行：分段切换那一行是 fieldset、开关那一行是 label，其余是 div。 */
export function XhFormatInputItem({ value, children, ...rest }: XhFormatInputItemProps): ReactNode {
  const ctx = useFormatInputContext()
  return createElement(formatInputItemTag(value, ctx.api.kindControl), mergeReactProps(ctx.api.getItemProps(value) as Record<string, unknown>, rest as Record<string, unknown>), children)
}

export interface XhFormatInputItemLabelProps extends Omit<ComponentPropsWithRef<'span'>, 'value'> {
  /** 名字所属的那一行：参数名，或 kind。 */
  value: FormatInputOption | 'kind'
}
/** 参数行的名字：在 fieldset 里是 legend，其余是 span。 */
export function XhFormatInputItemLabel({ value, children, ...rest }: XhFormatInputItemLabelProps): ReactNode {
  const ctx = useFormatInputContext()
  return createElement(formatInputItemLabelTag(value, ctx.api.kindControl), mergeReactProps(ctx.api.getItemLabelProps(value) as Record<string, unknown>, rest as Record<string, unknown>), children)
}

export interface XhFormatInputPatternDescriptionProps extends ComponentPropsWithRef<'p'> {}
export function XhFormatInputPatternDescription({ children, ...rest }: XhFormatInputPatternDescriptionProps): ReactNode {
  const ctx = useFormatInputContext()
  return <p {...mergeReactProps(ctx.api.getPatternDescriptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</p>
}

export interface XhFormatInputPreviewProps extends ComponentPropsWithRef<'div'> {}
export function XhFormatInputPreview({ children, ...rest }: XhFormatInputPreviewProps): ReactNode {
  const ctx = useFormatInputContext()
  return <div {...mergeReactProps(ctx.api.getPreviewProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children ?? ctx.api.previewText}</div>
}

export interface XhFormatInputErrorTextProps extends ComponentPropsWithRef<'p'> {}
export function XhFormatInputErrorText({ children, ...rest }: XhFormatInputErrorTextProps): ReactNode {
  const ctx = useFormatInputContext()
  return <p {...mergeReactProps(ctx.api.getErrorTextProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children ?? ctx.api.issueText}</p>
}

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

/** 不给 children 时铺开的整套结构：照 headless 的 formatInputStructure 渲，与 Web Components 不写部件时元素生成的节点出自同一份。 */
function renderDefaultStructure(api: FormatInputApi, translations: FormatInputTranslations): ReactNode[] {
  return renderStructure(formatInputStructure(api, translations), FORMAT_INPUT_PARTS as Record<string, (props: never) => ReactNode>, undefined, FORMAT_INPUT_INSTANCES as Record<string, (props: never) => ReactNode>)
}
