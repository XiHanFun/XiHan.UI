/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 fieldset 相关实现。

import type { FieldsetProps, FieldsetTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { fieldsetStructure, hasNamingContent } from '@xihan-ui/headless'
import { useContext, useMemo, useRef } from 'react'
import { useXhConfig, withXhConfig, XhConfigProvider } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderStructure } from '../../runtime/structure'
import { FieldsetOuterDisabled, FieldsetProvider, useFieldsetContext } from './context'
import { useFieldset, useFieldsetPartPresence } from './use-fieldset'

export interface XhFieldsetRootProps extends ComponentPropsWithRef<'fieldset'> {
  /** 组标题。不给 children 时铺 legend 部件。 */
  legend?: ReactNode
  /** 组标题下的说明。不给 children 时铺 description 部件。 */
  description?: ReactNode
  /** 组里的字段。不给 children 时铺进 field-group 部件：宽度够时并排分栏，只放一个容器时它占满整行。 */
  fieldGroup?: ReactNode
  /** 错误文案。不给 children 时铺 error-text 部件，invalid 时显示。 */
  errorText?: ReactNode
  /** 组末尾的按钮行。不给 children 时铺 actions 部件。 */
  actions?: ReactNode
  /** 整组禁用：写为原生 disabled，浏览器把组内每个表单控件一并禁用。 */
  disabled?: boolean
  invalid?: boolean
  required?: boolean
  translations?: Partial<FieldsetTranslations>
  children?: ReactNode
}

/** 必须是原生 fieldset：整组禁用连带组内控件是浏览器提供的，换为 div 就只剩一层灰样式。 */
export function XhFieldsetRoot({
  legend,
  description,
  fieldGroup,
  errorText,
  actions,
  disabled,
  invalid,
  required,
  translations,
  children,
  ...rest
}: XhFieldsetRootProps): ReactNode {
  const ctx = useFieldset(withXhConfig('fieldset', {
    disabled,
    invalid,
    required,
    translations,
  }) as FieldsetProps)
  const outerDisabled = useXhConfig().disabled === true
  // 整组禁用经作用域配置压进子树：组内组件库的控件各自拿到 disabled，行为与禁用面一起到位。
  // 原生 fieldset[disabled] 只管得住原生表单控件，滑块、取色区这类非原生交互节点与各家族的禁用面它够不着
  const scope = useMemo(() => ({ disabled: ctx.api.disabled || undefined }), [ctx.api.disabled])
  return (
    <FieldsetProvider value={ctx}>
      <FieldsetOuterDisabled value={outerDisabled}>
        <XhConfigProvider config={scope}>
          <fieldset {...mergeReactProps(ctx.api.getRootProps(), rest)}>
            {children ?? renderDefaultStructure(legend, { 'description': description, 'field-group': fieldGroup, 'error-text': errorText, 'actions': actions })}
          </fieldset>
        </XhConfigProvider>
      </FieldsetOuterDisabled>
    </FieldsetProvider>
  )
}

export interface XhFieldsetLegendProps extends ComponentPropsWithRef<'legend'> {}
/** 原生 legend 只有作为 fieldset 的首个子节点时才充当该组的名字。 */
export function XhFieldsetLegend({ children, ...rest }: XhFieldsetLegendProps): ReactNode {
  const ctx = useFieldsetContext()
  // legend 里的控件不吃本组的禁用（原生语义：首个 legend 内的控件不受所在 fieldset 禁用），恢复成外层的
  const outerDisabled = useContext(FieldsetOuterDisabled)
  const scope = useMemo(() => ({ disabled: outerDisabled }), [outerDisabled])
  return (
    <legend {...mergeReactProps(ctx.api.getLegendProps(), rest)}>
      <XhConfigProvider config={scope}>{children}</XhConfigProvider>
    </legend>
  )
}

export interface XhFieldsetDescriptionProps extends ComponentPropsWithRef<'p'> {}
export function XhFieldsetDescription({ children, ...rest }: XhFieldsetDescriptionProps): ReactNode {
  const ctx = useFieldsetContext()
  const el = useRef<HTMLParagraphElement | null>(null)
  // 读不出一句话的说明不进描述链
  useFieldsetPartPresence(ctx, 'description', () => el.current != null && hasNamingContent(el.current))
  return <p {...mergeReactProps({ ...ctx.api.getDescriptionProps() as Record<string, unknown>, ref: el }, rest as Record<string, unknown>)}>{children}</p>
}

export interface XhFieldsetFieldGroupProps extends ComponentPropsWithRef<'div'> {}
/** 把并排的几个字段圈为一段；纯排版。 */
export function XhFieldsetFieldGroup({ children, ...rest }: XhFieldsetFieldGroupProps): ReactNode {
  const ctx = useFieldsetContext()
  return <div {...mergeReactProps(ctx.api.getFieldGroupProps(), rest)}>{children}</div>
}

export interface XhFieldsetActionsProps extends ComponentPropsWithRef<'div'> {}
/** 组末尾的按钮行；纯排版。 */
export function XhFieldsetActions({ children, ...rest }: XhFieldsetActionsProps): ReactNode {
  const ctx = useFieldsetContext()
  return <div {...mergeReactProps(ctx.api.getActionsProps(), rest)}>{children}</div>
}

export interface XhFieldsetErrorTextProps extends ComponentPropsWithRef<'p'> {}
/** 节点常驻，依靠 hidden 显隐：活区要先在场才能播报，卸载重挂读屏无法读到。 */
export function XhFieldsetErrorText({ children, ...rest }: XhFieldsetErrorTextProps): ReactNode {
  const ctx = useFieldsetContext()
  useFieldsetPartPresence(ctx, 'errorText')
  return <p {...mergeReactProps(ctx.api.getErrorTextProps(), rest)}>{children}</p>
}

/** 标准结构里各部件对应的组件。 */
const FIELDSET_PARTS = {
  'legend': XhFieldsetLegend,
  'description': XhFieldsetDescription,
  'field-group': XhFieldsetFieldGroup,
  'error-text': XhFieldsetErrorText,
  'actions': XhFieldsetActions,
}

type FieldsetSections = Readonly<Partial<Record<'legend' | 'description' | 'field-group' | 'error-text' | 'actions', ReactNode>>>

/**
 * 未写 children 时铺开的整套结构：照 headless 的 fieldsetStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。文字以外的组标题内容交给 legend 部件。
 */
function renderDefaultStructure(legend: ReactNode, rest: Omit<FieldsetSections, 'legend'>): ReactNode[] {
  const sections: FieldsetSections = { ...rest, legend: typeof legend === 'string' ? undefined : legend }
  const nodes = fieldsetStructure({
    legend: typeof legend === 'string' ? legend : undefined,
    slotted: name => sections[name as keyof FieldsetSections] != null,
  })
  return renderStructure(nodes, FIELDSET_PARTS, node => (node.slot ? sections[node.slot.name as keyof FieldsetSections] : undefined))
}
