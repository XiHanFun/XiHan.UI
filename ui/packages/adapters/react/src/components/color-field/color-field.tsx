/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color field 相关实现。

import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { ColorFormat } from '@xihan-ui/core/color'
import type { ColorFieldApi, ColorFieldSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { colorFieldStructure } from '@xihan-ui/headless'
import { useEffect } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { ColorFieldProvider, useColorFieldContext } from './context'
import { useColorField } from './use-color-field'

type ColorFieldProps = ColorFieldSchema['props']

export type ColorFieldRootSlotProps = Pick<
  ColorFieldApi,
  'value' | 'empty' | 'text' | 'editing' | 'valid' | 'invalid' | 'canClear' | 'setValue' | 'clear' | 'commit'
>

export interface XhColorFieldRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue'> {
  /** 标题。不给 children 时铺 label 部件。 */
  label?: ReactNode
  /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
  ariaLabel?: string
  /** 颜色串；给定即受控。空串表示没有颜色。 */
  value?: string
  defaultValue?: string
  /** 值串的写法：hex / rgba / hsla / oklch，默认 hex。 */
  format?: ColorFormat
  /** 带透明度，默认关闭。 */
  alpha?: boolean
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  invalid?: boolean
  /** 表单字段名；提供后才参与提交。 */
  name?: string
  clearable?: boolean
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  translations?: ColorFieldProps['translations']
  onValueChange?: ColorFieldProps['onValueChange']
  /** 用户按清空钮（clear-trigger）清掉了值；先发值变化，再发它。程序化的 clear() 不发。 */
  onClear?: () => void
  children?: SlotChildren<ColorFieldRootSlotProps>
}

export function XhColorFieldRoot({
  label,
  ariaLabel,
  value,
  defaultValue,
  format,
  alpha,
  placeholder,
  disabled,
  readOnly,
  required,
  invalid,
  name,
  clearable,
  variant,
  tone,
  size,
  translations,
  onValueChange,
  onClear,
  children,
  ...rest
}: XhColorFieldRootProps): ReactNode {
  const ctx = useColorField(withXhConfig('color-field', useFormControlProps({
    ariaLabel,
    value,
    defaultValue,
    format,
    alpha,
    placeholder,
    disabled,
    readOnly,
    required,
    invalid,
    name,
    clearable,
    variant,
    tone,
    size,
    translations,
    onValueChange,
    onClear,
  })))
  const api = ctx.api

  return (
    <ColorFieldProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: ctx.rootRef },
        )}
      >
        {children != null
          ? renderSlot(children, {
              value: api.value,
              empty: api.empty,
              text: api.text,
              editing: api.editing,
              valid: api.valid,
              invalid: api.invalid,
              canClear: api.canClear,
              setValue: api.setValue,
              clear: api.clear,
              commit: api.commit,
            })
          : renderDefaultStructure(api, label, name !== undefined)}
      </div>
    </ColorFieldProvider>
  )
}

XhColorFieldRoot.xhEvents = ['clear', 'value-change'] as const

export interface XhColorFieldLabelProps extends ComponentPropsWithRef<'label'> {}

export function XhColorFieldLabel({ children, ...rest }: XhColorFieldLabelProps): ReactNode {
  const ctx = useColorFieldContext()
  // 渲出来了才登记：可聚焦部件的 aria-labelledby 只在这个节点真在场时才指过来
  const { registerLabel } = ctx
  useEffect(() => registerLabel(), [registerLabel])
  // 必须是原生 <label>，connect 把 for 写向 input
  return (
    <label {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </label>
  )
}

export interface XhColorFieldControlProps extends ComponentPropsWithRef<'div'> {}

export function XhColorFieldControl({ children, ...rest }: XhColorFieldControlProps): ReactNode {
  const ctx = useColorFieldContext()
  // 视觉盒：色块、输入框与清空按钮都放进来，皮肤把描边、底色、聚焦环画在它身上
  return (
    <div {...mergeReactProps(ctx.api.getControlProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhColorFieldSwatchProps extends ComponentPropsWithRef<'span'> {}

/** 当前颜色的色块：色块面家族绘制棋盘格与描边，颜色由连接层写入私有槽。 */
export function XhColorFieldSwatch(props: XhColorFieldSwatchProps): ReactNode {
  const ctx = useColorFieldContext()
  return <span {...mergeReactProps(ctx.api.getSwatchProps() as Record<string, unknown>, props as Record<string, unknown>)} />
}

export interface XhColorFieldInputProps extends ComponentPropsWithRef<'input'> {}

export function XhColorFieldInput(props: XhColorFieldInputProps): ReactNode {
  // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
  const fieldWiring = useFieldStateWiring()
  // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
  const fieldLabel = useFieldLabelWiring()
  const ctx = useColorFieldContext()
  return (
    <input
      {...mergeReactProps(
        fieldLabel({ ...fieldWiring, ...ctx.api.getInputProps() as Record<string, unknown> }),
        props as Record<string, unknown>,
      )}
    />
  )
}

export interface XhColorFieldClearTriggerProps extends ComponentPropsWithRef<'button'> {}

export function XhColorFieldClearTrigger({ children, ...rest }: XhColorFieldClearTriggerProps): ReactNode {
  const ctx = useColorFieldContext()
  return (
    <button {...mergeReactProps(ctx.api.getClearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhColorFieldHiddenInputProps extends ComponentPropsWithRef<'input'> {}

export function XhColorFieldHiddenInput(props: XhColorFieldHiddenInputProps): ReactNode {
  const ctx = useColorFieldContext()
  return <input {...mergeReactProps(ctx.api.getHiddenInputProps() as Record<string, unknown>, props as Record<string, unknown>)} />
}

/** 标准结构里各部件对应的组件。 */
const COLOR_FIELD_PARTS = {
  'label': XhColorFieldLabel,
  'control': XhColorFieldControl,
  'swatch': XhColorFieldSwatch,
  'input': XhColorFieldInput,
  'clear-trigger': XhColorFieldClearTrigger,
  'hidden-input': XhColorFieldHiddenInput,
}

/**
 * 未写 children 时铺开的整套结构：照 headless 的 colorFieldStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。文字以外的标题内容交给 label 部件。
 */
function renderDefaultStructure(api: ColorFieldApi, label: ReactNode, hiddenInput: boolean): ReactNode[] {
  const slotted = label != null && typeof label !== 'string'
  const nodes = colorFieldStructure(api, { label: typeof label === 'string' ? label : undefined, hiddenInput, slotted: name => name === 'label' && slotted })
  return renderStructure(nodes, COLOR_FIELD_PARTS, node => (node.slot ? label : undefined))
}
