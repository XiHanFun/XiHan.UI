/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 text field 相关实现。

import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { TextFieldApi, TextFieldInputHost, TextFieldSchema, TextFieldType } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { autoSizeTextarea, textFieldStructure } from '@xihan-ui/headless'
import { useCallback, useEffect, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { TextFieldProvider, useTextFieldContext } from './context'
import { useTextField } from './use-text-field'

type TextFieldProps = TextFieldSchema['props']

/** 函数式 children 的载荷：当前值、值状态标志与写值方法。 */
export type TextFieldRootSlotProps = Pick<
  TextFieldApi,
  'value' | 'empty' | 'atLimit' | 'count' | 'canClear' | 'setValue' | 'clear'
>

/** 字数部件函数式 children 的载荷：当前字数、上限与已达上限的标志。 */
export type TextFieldCountSlotProps = Pick<TextFieldApi, 'count' | 'maxLength' | 'atLimit'>

export interface XhTextFieldRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
  ariaLabel?: string
  /** 标题。不给 children 时铺 label 部件。 */
  label?: ReactNode
  /** 不给 children 时输入框铺 textarea（多行，接入 autoSize 自动高度）；手写部件时由 XhTextFieldInput 的 as 决定。 */
  multiline?: boolean
  value?: string
  defaultValue?: string
  type?: TextFieldType
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  invalid?: boolean
  /** 表单字段名；提供后才参与提交。 */
  name?: string
  maxLength?: number
  clearable?: boolean
  showCount?: boolean
  autoSize?: TextFieldProps['autoSize']
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  translations?: TextFieldProps['translations']
  onValueChange?: TextFieldProps['onValueChange']
  /** 用户按清空钮（clear-trigger）清掉了值；先发值变化，再发它。程序化的 clear() 不发。 */
  onClear?: () => void
  children?: SlotChildren<TextFieldRootSlotProps>
}

export function XhTextFieldRoot({
  ariaLabel,
  label,
  multiline,
  value,
  defaultValue,
  type,
  placeholder,
  disabled,
  readOnly,
  required,
  invalid,
  name,
  maxLength,
  clearable,
  showCount,
  autoSize,
  variant,
  tone,
  size,
  translations,
  onValueChange,
  onClear,
  children,
  ...rest
}: XhTextFieldRootProps): ReactNode {
  const ctx = useTextField(withXhConfig('text-field', useFormControlProps({
    ariaLabel,
    value,
    defaultValue,
    type,
    placeholder,
    disabled,
    readOnly,
    required,
    invalid,
    name,
    maxLength,
    clearable,
    showCount,
    autoSize,
    variant,
    tone,
    size,
    translations,
    onValueChange,
    onClear,
  })) as TextFieldProps)
  const api = ctx.api
  return (
    <TextFieldProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps(),
          rest,
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {children != null
          ? renderSlot(children, {
              value: api.value,
              empty: api.empty,
              atLimit: api.atLimit,
              count: api.count,
              canClear: api.canClear,
              setValue: api.setValue,
              clear: api.clear,
            })
          : renderDefaultStructure(api, label, multiline)}
      </div>
    </TextFieldProvider>
  )
}

XhTextFieldRoot.xhEvents = ['clear', 'value-change'] as const

export interface XhTextFieldLabelProps extends ComponentPropsWithRef<'label'> {}
/** 必须是原生 label，connect 把 for 指向 input。 */
export function XhTextFieldLabel({ children, ...rest }: XhTextFieldLabelProps): ReactNode {
  const ctx = useTextFieldContext()
  // 渲出来了才登记：可聚焦部件的 aria-labelledby 只在这个节点真在场时才指过来
  const { registerLabel } = ctx
  useEffect(() => registerLabel(), [registerLabel])
  return (
    <label {...mergeReactProps(ctx.api.getLabelProps(), rest)}>
      {children}
    </label>
  )
}

export interface XhTextFieldControlProps extends ComponentPropsWithRef<'div'> {}
/** 视觉盒：输入框与清空按钮都放入其中，皮肤把描边、底色、聚焦环绘制在它上面。 */
export function XhTextFieldControl({ children, ...rest }: XhTextFieldControlProps): ReactNode {
  const ctx = useTextFieldContext()
  return (
    <div {...mergeReactProps(ctx.api.getControlProps(), rest)}>
      {children}
    </div>
  )
}

export interface XhTextFieldInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {
  /** 输入框渲染为哪个标签，默认 input；写 textarea 即多行宿主，接入 autoSize 自动高度。 */
  as?: TextFieldInputHost
}

export function XhTextFieldInput({ as = 'input', ...rest }: XhTextFieldInputProps): ReactNode {
  // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
  const fieldWiring = useFieldStateWiring()
  // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
  const fieldLabel = useFieldLabelWiring()
  const ctx = useTextFieldContext()
  const el = useRef<HTMLTextAreaElement | null>(null)
  const value = ctx.api.value
  const autoSize = ctx.api.autoSize
  const autoSizeRef = useRef(autoSize)
  autoSizeRef.current = autoSize
  const setInputRef = useCallback((node: HTMLElement | null): (() => void) | undefined => {
    const next = as === 'textarea' ? node as HTMLTextAreaElement | null : null
    if (el.current && el.current !== next)
      autoSizeTextarea(el.current, false)
    el.current = next
    if (!next)
      return undefined
    autoSizeTextarea(next, autoSizeRef.current)
    return () => {
      if (el.current !== next)
        return
      autoSizeTextarea(next, false)
      el.current = null
    }
  }, [as])

  // 程序化写值（setValue / 表单重置 / 受控回写）不触发 input 事件，量高在渲染后补一次
  useIsomorphicLayoutEffect(() => {
    if (el.current)
      autoSizeTextarea(el.current, autoSize)
  }, [as, value, autoSize])

  const props = mergeReactProps(
    fieldLabel({
      ...fieldWiring,
      ...ctx.api.getInputProps({ as }),
    }),
    rest,
    {
      ref: setInputRef,
    },
  )

  // 自己渲染宿主节点，label 的 for 指向它
  return as === 'textarea'
    ? <textarea {...props as ComponentPropsWithRef<'textarea'>} />
    : <input {...props as ComponentPropsWithRef<'input'>} />
}

export interface XhTextFieldPrefixProps extends ComponentPropsWithRef<'span'> {}
export function XhTextFieldPrefix({ children, ...rest }: XhTextFieldPrefixProps): ReactNode {
  const ctx = useTextFieldContext()
  return (
    <span {...mergeReactProps(ctx.api.getPrefixProps(), rest)}>
      {children}
    </span>
  )
}

export interface XhTextFieldSuffixProps extends ComponentPropsWithRef<'span'> {}
export function XhTextFieldSuffix({ children, ...rest }: XhTextFieldSuffixProps): ReactNode {
  const ctx = useTextFieldContext()
  return (
    <span {...mergeReactProps(ctx.api.getSuffixProps(), rest)}>
      {children}
    </span>
  )
}

export interface XhTextFieldClearTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhTextFieldClearTrigger({ children, ...rest }: XhTextFieldClearTriggerProps): ReactNode {
  const ctx = useTextFieldContext()
  return (
    <button {...mergeReactProps(ctx.api.getClearTriggerProps(), rest)}>
      {children}
    </button>
  )
}

export interface XhTextFieldCountProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  children?: SlotChildren<TextFieldCountSlotProps>
}

/** 字数：未写内容时渲染 `已用 / 上限`，未设上限时只渲染已用。 */
export function XhTextFieldCount({ children, ...rest }: XhTextFieldCountProps): ReactNode {
  const ctx = useTextFieldContext()
  const api = ctx.api
  const fallback = api.maxLength === undefined ? `${api.count}` : `${api.count} / ${api.maxLength}`
  const body = children == null
    ? fallback
    : renderSlot(children, { count: api.count, maxLength: api.maxLength, atLimit: api.atLimit })
  return (
    <span {...mergeReactProps(api.getCountProps(), rest)}>
      {body}
    </span>
  )
}

/** 标准结构里各部件对应的组件。 */
const TEXT_FIELD_PARTS = {
  'label': XhTextFieldLabel,
  'control': XhTextFieldControl,
  'input': XhTextFieldInput,
  'clear-trigger': XhTextFieldClearTrigger,
  'count': XhTextFieldCount,
}

/** 多行时标准结构里的输入框：XhTextFieldInput 以 textarea 渲染。 */
function XhTextFieldTextarea(props: Omit<XhTextFieldInputProps, 'as'>): ReactNode {
  return <XhTextFieldInput {...props} as="textarea" />
}

/**
 * 未写 children 时铺开的整套结构：照 headless 的 textFieldStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。文字以外的标题内容交给 label 部件。
 */
function renderDefaultStructure(api: TextFieldApi, label: ReactNode, multiline: boolean | undefined): ReactNode[] {
  const slotted = label != null && typeof label !== 'string'
  const nodes = textFieldStructure(api, { label: typeof label === 'string' ? label : undefined, multiline, slotted: name => name === 'label' && slotted })
  const parts = multiline ? { ...TEXT_FIELD_PARTS, input: XhTextFieldTextarea } : TEXT_FIELD_PARTS
  return renderStructure(nodes, parts, node => (node.slot ? label : undefined))
}
