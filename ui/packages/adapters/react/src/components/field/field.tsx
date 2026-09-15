/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 field 相关实现。

import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { mergeIntoChild } from '../../runtime/as-child'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot, slotPaints } from '../../runtime/slot-content'
import { useOptionalFormContext, useOptionalFormField } from '../form/context'
import { useFormControlProps } from '../form/use-form-control'
import { FieldProvider, useFieldContext } from './context'
import { useField } from './use-field'

/** 去掉角色标记，只保留接线属性（id 与 aria-*）。 */
export function wiringOnly(controlProps: Record<string, unknown>): Record<string, unknown> {
  const rest: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(controlProps)) {
    if (key !== 'data-scope' && key !== 'data-part')
      rest[key] = value
  }
  return rest
}

export interface XhFieldRootProps extends ComponentPropsWithRef<'div'> {
  invalid?: boolean
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  /** 控件节点的 id，不占用根节点自己的 DOM id。 */
  controlId?: string
}

/** 四个布尔默认 undefined：在 XhFormFieldGroup 中未写时从表单上下文自取，写了以写的为准。 */
export function XhFieldRoot({
  invalid,
  required,
  disabled,
  readOnly,
  controlId,
  children,
  ...rest
}: XhFieldRootProps): ReactNode {
  const ctx = useField(useFormControlProps({ invalid, required, disabled, readOnly, controlId }))
  return (
    <FieldProvider value={ctx}>
      <div {...mergeReactProps(ctx.api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </FieldProvider>
  )
}

export interface XhFieldLabelProps extends ComponentPropsWithRef<'label'> {}

export function XhFieldLabel({ children, ...rest }: XhFieldLabelProps): ReactNode {
  const ctx = useFieldContext()
  return (
    <label {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </label>
  )
}

/** 函数式 children 的载荷：控件节点应挂载的那组属性，作者把它交给自己渲染的控件。 */
export type FieldControlSlotProps = Record<string, unknown>

export interface XhFieldControlProps {
  /**
   * 把接线属性合并到唯一的子节点上，默认开启。
   *
   * 子节点是薄封装（根不是可聚焦元素）时关闭它：属性只经函数式 children 交出，
   * 由封装内部调用 useFieldControl 绑定到真实控件上。
   */
  asChild?: boolean
  children?: SlotChildren<FieldControlSlotProps>
}

/** 控件节点由作者渲染，这里只把 connect 产出的属性合并上去。 */
export function XhFieldControl({ asChild = true, children }: XhFieldControlProps): ReactNode {
  const ctx = useFieldContext()
  const controlProps = ctx.api.getControlProps() as Record<string, unknown>
  // control props 经函数式 children 交给作者，控件节点由作者渲染
  const rendered = renderSlot(children, controlProps)
  // 手工接线必须显式关闭 asChild，不能根据无效结构猜测作者意图。
  if (!asChild)
    return rendered
  return mergeIntoChild(rendered, controlProps, 'field/control')
}

export interface XhFieldDescriptionProps extends ComponentPropsWithRef<'p'> {}

export function XhFieldDescription({ children, ...rest }: XhFieldDescriptionProps): ReactNode {
  const ctx = useFieldContext()
  return (
    <p {...mergeReactProps(ctx.api.getDescriptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </p>
  )
}

export interface XhFieldErrorTextProps extends ComponentPropsWithRef<'p'> {}

/** 节点常驻，依靠 hidden 显隐；未提供内容时在表单中自取该字段的错误文案。 */
export function XhFieldErrorText({ children, ...rest }: XhFieldErrorTextProps): ReactNode {
  const ctx = useFieldContext()
  const form = useOptionalFormContext()
  const handle = useOptionalFormField()
  const given = slotPaints(children)
  const auto = !given && form && handle ? form.api.getFieldError(handle.name) : undefined
  return (
    <p {...mergeReactProps(ctx.api.getErrorTextProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {given ? children : auto}
    </p>
  )
}
