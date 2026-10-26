/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 field 相关实现。

import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { fieldStructure, hasNamingContent } from '@xihan-ui/headless'
import { useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { isRoleMarker, mergeIntoChild } from '../../runtime/as-child'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot, slotPaints } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useOptionalFormContext, useOptionalFormField } from '../form/context'
import { useFormControlProps } from '../form/use-form-control'
import { FieldProvider, useFieldContext } from './context'
import { useField, useFieldPartPresence } from './use-field'

/**
 * 去掉角色标记，只保留接线属性（id、aria-* 与状态位）。
 *
 * 角色标记含解剖两位与家族标记（data-xh-*）：control 投影了 Field Chrome 的视觉盒标记，
 * 落到薄封装的根上会在封装自己的视觉盒外再画一层壳。
 */
export function wiringOnly(controlProps: Record<string, unknown>): Record<string, unknown> {
  const rest: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(controlProps)) {
    if (!isRoleMarker(key))
      rest[key] = value
  }
  return rest
}

export interface XhFieldRootProps extends ComponentPropsWithRef<'div'> {
  /** 标题。不给 children 时铺 label 部件。 */
  label?: ReactNode
  /** 字段里的控件。不给 children 时原样放在标题之后，外面不包部件。 */
  control?: ReactNode
  /** 说明。不给 children 时铺说明部件。 */
  description?: ReactNode
  /** 错误文案。不给 children 时给了（空串也算）就铺错误文案部件，空串时在表单里自取该项的错误。 */
  errorText?: ReactNode
  invalid?: boolean
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  /** 控件节点的 id，不占用根节点自己的 DOM id。 */
  controlId?: string
}

/** 四个布尔默认 undefined：在 XhFormFieldGroup 中未写时从表单上下文自取，写了以写的为准。 */
export function XhFieldRoot({
  label,
  control,
  description,
  errorText,
  invalid,
  required,
  disabled,
  readOnly,
  controlId,
  children,
  ...rest
}: XhFieldRootProps): ReactNode {
  // 字段集压下来的作用域禁用也落到字段上：标题与说明随组内控件一起变淡
  const ctx = useField(withXhConfig('field', useFormControlProps({ invalid, required, disabled, readOnly, controlId })))
  return (
    <FieldProvider value={ctx}>
      <div {...mergeReactProps(ctx.api.getRootProps(), rest)}>
        {children ?? renderDefaultStructure({ label, control, description, errorText })}
      </div>
    </FieldProvider>
  )
}

export interface XhFieldLabelProps extends ComponentPropsWithRef<'label'> {}

export function XhFieldLabel({ children, ...rest }: XhFieldLabelProps): ReactNode {
  const ctx = useFieldContext()
  useFieldPartPresence(ctx, 'label')
  return (
    <label {...mergeReactProps(ctx.api.getLabelProps(), rest)}>
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
  // control 在场：label 的 for 指向它；不在场时由字段代为聚焦库内控件
  useFieldPartPresence(ctx, 'control')
  const controlProps = ctx.api.getControlProps()
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
  const el = useRef<HTMLParagraphElement | null>(null)
  // 读不出一句话的说明不进描述链
  useFieldPartPresence(ctx, 'description', () => el.current != null && hasNamingContent(el.current))
  return (
    <p {...mergeReactProps({ ...ctx.api.getDescriptionProps() as Record<string, unknown>, ref: el }, rest as Record<string, unknown>)}>
      {children}
    </p>
  )
}

export interface XhFieldErrorTextProps extends ComponentPropsWithRef<'p'> {}

/** 节点常驻，依靠 hidden 显隐；未提供内容时在表单中自取该字段的错误文案。 */
export function XhFieldErrorText({ children, ...rest }: XhFieldErrorTextProps): ReactNode {
  const ctx = useFieldContext()
  useFieldPartPresence(ctx, 'errorText')
  const form = useOptionalFormContext()
  const handle = useOptionalFormField()
  const given = slotPaints(children)
  const auto = !given && form && handle ? form.api.getFieldError(handle.name) : undefined
  return (
    <p {...mergeReactProps(ctx.api.getErrorTextProps(), rest)}>
      {given ? children : auto}
    </p>
  )
}

/** 标准结构里各部件对应的组件；控件是出口，原样放作者给的内容。 */
const FIELD_PARTS = {
  'label': XhFieldLabel,
  'description': XhFieldDescription,
  'error-text': XhFieldErrorText,
}

interface FieldSections {
  readonly label: ReactNode
  readonly control: ReactNode
  readonly description: ReactNode
  readonly errorText: ReactNode
}

/**
 * 未写 children 时铺开的整套结构：照 headless 的 fieldStructure 渲，与 Web Components 不写部件时元素生成的节点出自同一份。
 * control 原样放在标题之后；标题、说明、错误文案是字符串时作文字，是别的节点时由对应部件装着。
 */
function renderDefaultStructure({ label, control, description, errorText }: FieldSections): ReactNode[] {
  const text = (value: ReactNode): string | undefined => (typeof value === 'string' ? value : undefined)
  const nodes: Readonly<Record<string, ReactNode>> = {
    'label': typeof label === 'string' ? undefined : label,
    'description': typeof description === 'string' ? undefined : description,
    'error-text': typeof errorText === 'string' ? undefined : errorText,
    'control': control,
  }
  return renderStructure(
    fieldStructure({ label: text(label), description: text(description), errorText: text(errorText), slotted: name => nodes[name] != null }),
    FIELD_PARTS,
    node => (node.slot ? nodes[node.slot.name] : undefined),
    {},
    () => control ?? undefined,
  )
}
