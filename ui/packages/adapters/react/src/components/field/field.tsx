import type { FieldProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { Children, cloneElement, isValidElement } from 'react'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot, slotPaints } from '../../runtime/slot-content'
import { useOptionalFormContext, useOptionalFormField } from '../form/context'
import { FieldProvider, useFieldContext } from './context'
import { useField } from './use-field'

/** 去掉角色标记，只留接线属性（id 与 aria-*）。 */
export function wiringOnly(controlProps: Record<string, unknown>): Record<string, unknown> {
  const rest: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(controlProps)) {
    if (key !== 'data-scope' && key !== 'data-part')
      rest[key] = value
  }
  return rest
}

/** 子节点已带角色标记：组件节点的根由它自己渲染，元素节点看有没有写 data-scope。 */
function carriesOwnAnatomy(node: ReactElement<Record<string, unknown>>): boolean {
  return typeof node.type !== 'string' || node.props['data-scope'] != null
}

export interface XhFieldRootProps extends ComponentPropsWithRef<'div'> {
  invalid?: boolean
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  /** 控件节点的 id，不占用根节点自己的 DOM id。 */
  controlId?: string
}

/** 四个布尔缺省 undefined：在 XhFormFieldGroup 里没写就从表单上下文自取，写了以写的为准。 */
export function XhFieldRoot({
  invalid,
  required,
  disabled,
  readOnly,
  controlId,
  children,
  ...rest
}: XhFieldRootProps): ReactNode {
  const form = useOptionalFormContext()
  const handle = useOptionalFormField()
  const bound = form && handle ? { api: form.api, name: handle.name } : null
  const merged: FieldProps = {
    invalid: invalid ?? (bound ? bound.api.isFieldInvalid(bound.name) : undefined),
    required: required ?? (bound ? bound.api.isFieldRequired(bound.name) : undefined),
    disabled: disabled ?? (bound ? bound.api.disabled : undefined),
    readOnly: readOnly ?? (bound ? bound.api.readOnly : undefined),
    controlId,
  }
  const ctx = useField(merged)
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

/** 函数式 children 的载荷：控件节点该挂的那组属性，作者把它交给自己渲染的控件。 */
export type FieldControlSlotProps = Record<string, unknown>

export interface XhFieldControlProps {
  /**
   * 把接线属性合到唯一的子节点上，缺省开。
   *
   * 子节点是薄封装（根不是可聚焦元素）时关掉它：属性只经函数式 children 交出去，
   * 由封装内部调 useFieldControl 绑到真控件上。
   */
  asChild?: boolean
  children?: SlotChildren<FieldControlSlotProps>
}

/** 控件节点由作者渲染，这里只把 connect 产出的属性合上去。 */
export function XhFieldControl({ asChild = true, children }: XhFieldControlProps): ReactNode {
  const ctx = useFieldContext()
  const controlProps = ctx.api.getControlProps() as Record<string, unknown>
  // control props 经函数式 children 交给作者，控件节点由作者渲染
  const rendered = renderSlot(children, controlProps)
  const nodes = Children.toArray(rendered).filter(node => isValidElement(node))
  // 关了 asChild、或不止一个节点：都视为作者已用载荷自行接线
  if (!asChild || nodes.length !== 1)
    return rendered
  const node = nodes[0] as ReactElement<Record<string, unknown>>
  // 单个节点合并属性；它自带角色标记时不覆盖，只落接线属性
  const merged = carriesOwnAnatomy(node) ? wiringOnly(controlProps) : controlProps
  return cloneElement(node, mergeReactProps(node.props, merged))
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

/** 节点常挂，靠 hidden 显隐；没给内容时在表单里自取该字段的错误文案。 */
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
