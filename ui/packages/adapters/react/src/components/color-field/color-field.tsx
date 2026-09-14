/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color field 相关实现。

import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { ColorFieldApi, ColorFieldSchema, ColorFormat } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
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
  /** 颜色串；给定即受控。空串表示没有颜色。 */
  value?: string
  defaultValue?: string
  /** 值串的写法：hex / rgba / hsla，默认 hex。 */
  format?: ColorFormat
  /** 带透明度，默认关。 */
  alpha?: boolean
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  invalid?: boolean
  /** 表单字段名；给了才参与提交。 */
  name?: string
  clearable?: boolean
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  translations?: ColorFieldProps['translations']
  onValueChange?: ColorFieldProps['onValueChange']
  children?: SlotChildren<ColorFieldRootSlotProps>
}

export function XhColorFieldRoot({
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
  children,
  ...rest
}: XhColorFieldRootProps): ReactNode {
  const ctx = useColorField(withXhConfig('color-field', useFormControlProps({
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
        {renderSlot(children, {
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
        })}
      </div>
    </ColorFieldProvider>
  )
}

XhColorFieldRoot.xhEvents = ['value-change'] as const

export interface XhColorFieldLabelProps extends ComponentPropsWithRef<'label'> {}

export function XhColorFieldLabel({ children, ...rest }: XhColorFieldLabelProps): ReactNode {
  const ctx = useColorFieldContext()
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

/** 当前颜色的色块：色块面家族画棋盘格与描边，颜色由连接层写进私有槽。 */
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
