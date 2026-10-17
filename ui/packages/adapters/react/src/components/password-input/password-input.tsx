/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 password input 相关实现。

import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { PasswordInputApi, PasswordInputSchema, PasswordInputTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { passwordInputStructure, withFieldDescription } from '@xihan-ui/headless'
import { useEffect } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { PasswordInputProvider, usePasswordInputContext } from './context'
import { usePasswordInput } from './use-password-input'

type PasswordInputProps = PasswordInputSchema['props']

/** 函数式 children 的载荷：当前值与空标志、明暗与大写锁定，以及写值与切换明暗的动作。 */
export type PasswordInputRootSlotProps = Pick<
  PasswordInputApi,
  'value' | 'empty' | 'revealed' | 'capsLock' | 'inputType' | 'setValue' | 'setRevealed' | 'toggleRevealed'
>

/** 根上自有的取值；defaultValue 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue'>

export interface XhPasswordInputRootProps extends RootElementProps {
  /** 标题。不给 children 时铺 label 部件。 */
  label?: ReactNode
  /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
  ariaLabel?: string
  value?: string
  defaultValue?: string
  revealed?: boolean
  defaultRevealed?: boolean
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  invalid?: boolean
  /** 表单字段名；提供后才参与提交。 */
  name?: string
  placeholder?: string
  autoComplete?: string
  /** 强度档位 0–4，由调用方评分后传入；未提供时强度条收起。 */
  strength?: number
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  translations?: Partial<PasswordInputTranslations>
  onValueChange?: PasswordInputProps['onValueChange']
  onRevealedChange?: PasswordInputProps['onRevealedChange']
  children?: SlotChildren<PasswordInputRootSlotProps>
}

export function XhPasswordInputRoot({
  label,
  ariaLabel,
  value,
  defaultValue,
  revealed,
  defaultRevealed,
  disabled,
  readOnly,
  required,
  invalid,
  name,
  placeholder,
  autoComplete,
  strength,
  variant,
  tone,
  size,
  translations,
  onValueChange,
  onRevealedChange,
  children,
  ...rest
}: XhPasswordInputRootProps): ReactNode {
  const machineProps = {
    ariaLabel,
    value,
    defaultValue,
    revealed,
    defaultRevealed,
    disabled,
    readOnly,
    required,
    invalid,
    name,
    placeholder,
    autoComplete,
    strength,
    variant,
    tone,
    size,
    translations,
    onValueChange,
    onRevealedChange,
  }
  const ctx = usePasswordInput(withXhConfig('password-input', useFormControlProps(machineProps)) as PasswordInputProps)
  const api = ctx.api
  return (
    <PasswordInputProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {children != null
          ? renderSlot(children, {
              value: api.value,
              empty: api.empty,
              revealed: api.revealed,
              capsLock: api.capsLock,
              inputType: api.inputType,
              setValue: api.setValue,
              setRevealed: api.setRevealed,
              toggleRevealed: api.toggleRevealed,
            })
          : renderDefaultStructure(api, label)}
      </div>
    </PasswordInputProvider>
  )
}

XhPasswordInputRoot.xhEvents = ['value-change', 'revealed-change'] as const

export interface XhPasswordInputLabelProps extends ComponentPropsWithRef<'label'> {}
/** 必须是原生 label，connect 把 for 指向 input。 */
export function XhPasswordInputLabel({ children, ...rest }: XhPasswordInputLabelProps): ReactNode {
  const ctx = usePasswordInputContext()
  // 渲出来了才登记：可聚焦部件的 aria-labelledby 只在这个节点真在场时才指过来
  const { registerLabel } = ctx
  useEffect(() => registerLabel(), [registerLabel])
  return (
    <label {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </label>
  )
}

export interface XhPasswordInputControlProps extends ComponentPropsWithRef<'div'> {}
/** 视觉盒：输入框、切换按钮与大写锁定提示都排在其中。 */
export function XhPasswordInputControl({ children, ...rest }: XhPasswordInputControlProps): ReactNode {
  const ctx = usePasswordInputContext()
  return (
    <div {...mergeReactProps(ctx.api.getControlProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhPasswordInputInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}
/** 原生 input：光标、选区与撤销都归浏览器，label 的 for 也指向它。 */
export function XhPasswordInputInput({ ...rest }: XhPasswordInputInputProps): ReactNode {
  // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
  const fieldWiring = useFieldStateWiring()
  // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
  const fieldLabel = useFieldLabelWiring()
  const ctx = usePasswordInputContext()
  return (
    <input
      {...mergeReactProps(
        // 输入框自己的描述链（大写锁定提示）与字段的拼起来，不互相顶掉
        fieldLabel(withFieldDescription(
          { ...fieldWiring, ...ctx.api.getInputProps() as Record<string, unknown> },
          fieldWiring['aria-describedby'] as string | undefined,
        )),
        rest as Record<string, unknown>,
      )}
    />
  )
}

export interface XhPasswordInputVisibilityTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 原生 button，Enter / Space 的激活交给平台。 */
export function XhPasswordInputVisibilityTrigger({ children, ...rest }: XhPasswordInputVisibilityTriggerProps): ReactNode {
  const ctx = usePasswordInputContext()
  return (
    <button {...mergeReactProps(ctx.api.getVisibilityTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhPasswordInputCapsLockIndicatorProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {}
/** 区内文字由组件写入：活区域播报的是内容，不是名字。关闭时是空串，节点仍在场。 */
export function XhPasswordInputCapsLockIndicator({ ...rest }: XhPasswordInputCapsLockIndicatorProps): ReactNode {
  const ctx = usePasswordInputContext()
  return (
    <span {...mergeReactProps(ctx.api.getCapsLockIndicatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {ctx.api.capsLockMessage}
    </span>
  )
}

export interface XhPasswordInputStrengthMeterProps extends ComponentPropsWithRef<'div'> {}
/** 强度条：档位由调用方评分后经 strength 传入，未提供时收起。 */
export function XhPasswordInputStrengthMeter({ children, ...rest }: XhPasswordInputStrengthMeterProps): ReactNode {
  const ctx = usePasswordInputContext()
  return (
    <div {...mergeReactProps(ctx.api.getStrengthMeterProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

/** 标准结构里各部件对应的组件。 */
const PASSWORD_INPUT_PARTS = {
  'label': XhPasswordInputLabel,
  'control': XhPasswordInputControl,
  'input': XhPasswordInputInput,
  'caps-lock-indicator': XhPasswordInputCapsLockIndicator,
  'visibility-trigger': XhPasswordInputVisibilityTrigger,
  'strength-meter': XhPasswordInputStrengthMeter,
}

/**
 * 未写 children 时铺开的整套结构：照 headless 的 passwordInputStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。文字以外的标题内容交给 label 部件。
 */
function renderDefaultStructure(api: PasswordInputApi, label: ReactNode): ReactNode[] {
  const slotted = label != null && typeof label !== 'string'
  const nodes = passwordInputStructure(api, { label: typeof label === 'string' ? label : undefined, slotted: name => name === 'label' && slotted })
  return renderStructure(nodes, PASSWORD_INPUT_PARTS, node => (node.slot ? label : undefined))
}
