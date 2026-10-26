/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 expression input 相关实现。

import type { ControlVariant, Direction, ExpressionCheck, ExpressionCompletionSource, Placement, Size, Tone } from '@xihan-ui/core'
import type { FunctionTable } from '@xihan-ui/expression'
import type { ExpressionInputApi, ExpressionInputAutoSize, ExpressionInputEl, ExpressionInputHost, ExpressionInputItem, ExpressionInputSchema, ExpressionInputTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { expressionInputStructure, withFieldDescription } from '@xihan-ui/headless'
import { useEffect } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { ExpressionInputItemProvider, ExpressionInputProvider, useExpressionInputContext, useExpressionInputItemContext } from './context'
import { useExpressionInput } from './use-expression-input'

type ExpressionInputProps = ExpressionInputSchema['props']

/** 函数式 children 的载荷：值、开合、补全条目、问题与镜像层分段，空态与种类文案，以及改写值、插入文本与收起的句柄。 */
export type ExpressionInputRootSlotProps = Pick<
  ExpressionInputApi,
  | 'value'
  | 'open'
  | 'items'
  | 'issues'
  | 'segments'
  | 'emptyText'
  | 'kindText'
  | 'highlightedKey'
  | 'setValue'
  | 'insert'
  | 'close'
>

/** 根上自有的取值；defaultValue 与 dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue' | 'dir'>

export interface XhExpressionInputRootProps extends RootElementProps {
  /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
  ariaLabel?: string
  value?: string
  defaultValue?: string
  check?: ExpressionCheck
  completions?: ExpressionCompletionSource
  functions?: FunctionTable
  /** 标题文字；给了即在缺省结构里铺 label 部件。 */
  label?: string
  multiline?: boolean
  placeholder?: string
  name?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  invalid?: boolean
  autoSize?: boolean | ExpressionInputAutoSize
  checkDelay?: number
  loop?: boolean
  placement?: Placement
  offset?: number
  /** 文字方向；浮层迁移到落点后无法继承作者子树上的方向，需要 RTL 时显式提供。 */
  dir?: Direction
  translations?: Partial<ExpressionInputTranslations>
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  onValueChange?: ExpressionInputProps['onValueChange']
  onIssuesChange?: ExpressionInputProps['onIssuesChange']
  onCompletionSelect?: ExpressionInputProps['onCompletionSelect']
  onOpenChange?: ExpressionInputProps['onOpenChange']
  children?: SlotChildren<ExpressionInputRootSlotProps>
}

export function XhExpressionInputRoot({
  ariaLabel,
  value,
  defaultValue,
  check,
  completions,
  functions,
  label,
  multiline,
  placeholder,
  name,
  disabled,
  readOnly,
  required,
  invalid,
  autoSize,
  checkDelay,
  loop,
  placement,
  offset,
  dir,
  translations,
  variant,
  tone,
  size,
  onValueChange,
  onIssuesChange,
  onCompletionSelect,
  onOpenChange,
  children,
  ...rest
}: XhExpressionInputRootProps): ReactNode {
  const machineProps = {
    ariaLabel,
    value,
    defaultValue,
    check,
    completions,
    functions,
    label,
    multiline,
    placeholder,
    name,
    disabled,
    readOnly,
    required,
    invalid,
    autoSize,
    checkDelay,
    loop,
    placement,
    offset,
    dir,
    translations,
    variant,
    tone,
    size,
    onValueChange,
    onIssuesChange,
    onCompletionSelect,
    onOpenChange,
  }
  const ctx = useExpressionInput(withXhConfig('expression-input', useFormControlProps(machineProps)) as ExpressionInputProps)
  const api = ctx.api

  const body = children != null
    ? renderSlot(children, {
        value: api.value,
        open: api.open,
        items: api.items,
        issues: api.issues,
        segments: api.segments,
        emptyText: api.emptyText,
        kindText: api.kindText,
        highlightedKey: api.highlightedKey,
        setValue: api.setValue,
        insert: api.insert,
        close: api.close,
      })
    : renderDefaultStructure(api, label, !!multiline)

  return (
    <ExpressionInputProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps(),
          rest,
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {body}
      </div>
    </ExpressionInputProvider>
  )
}

XhExpressionInputRoot.xhEvents = ['value-change', 'issues-change', 'completion-select', 'open-change'] as const

export interface XhExpressionInputLabelProps extends ComponentPropsWithRef<'label'> {}
/** 使用原生 label，connect 给出的 for 恒指向输入框。 */
export function XhExpressionInputLabel({ children, ...rest }: XhExpressionInputLabelProps): ReactNode {
  const ctx = useExpressionInputContext()
  const { registerLabel } = ctx
  useEffect(() => registerLabel(), [registerLabel])
  return <label {...mergeReactProps(ctx.api.getLabelProps(), rest)}>{children}</label>
}

export interface XhExpressionInputControlProps extends ComponentPropsWithRef<'div'> {}
/** 字段视觉盒：输入框与镜像层叠在里面。 */
export function XhExpressionInputControl({ children, ...rest }: XhExpressionInputControlProps): ReactNode {
  const ctx = useExpressionInputContext()
  return <div {...mergeReactProps(ctx.api.getControlProps(), rest)}>{children}</div>
}

export interface XhExpressionInputInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue'>, Pick<ComponentPropsWithRef<'textarea'>, 'rows' | 'cols' | 'wrap'> {
  /** 输入框渲染为哪个标签；缺省跟着根上的 multiline。 */
  as?: ExpressionInputHost
}
/** 输入框；缺省跟着根上的 multiline，写 as 时以它为准。 */
export function XhExpressionInputInput({ as, ...rest }: XhExpressionInputInputProps): ReactNode {
  const ctx = useExpressionInputContext()
  const fieldWiring = useFieldStateWiring()
  const fieldLabel = useFieldLabelWiring()
  const tag: ExpressionInputHost = as ?? (ctx.multiline ? 'textarea' : 'input')
  const { setMultiline } = ctx
  useEffect(() => setMultiline(tag === 'textarea'), [setMultiline, tag])
  // 输入框自己的描述链（问题列表）与字段的拼起来，字段的在前
  const props = mergeReactProps(
    fieldLabel(withFieldDescription(
      { ...fieldWiring, ...ctx.api.getInputProps({ as: tag }) },
      fieldWiring['aria-describedby'] as string | undefined,
    )),
    rest,
    { ref: (el: ExpressionInputEl | null) => { ctx.inputRef.current = el } },
  )
  return tag === 'textarea'
    ? <textarea {...props as ComponentPropsWithRef<'textarea'>} />
    : <input {...props as ComponentPropsWithRef<'input'>} />
}

export interface XhExpressionInputHighlightProps extends ComponentPropsWithRef<'div'> {}
/** 镜像层：把问题区间画成波浪下划线，对读屏隐藏。 */
export function XhExpressionInputHighlight({ children, ...rest }: XhExpressionInputHighlightProps): ReactNode {
  const ctx = useExpressionInputContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getHighlightProps(),
        rest,
        { ref: (el: HTMLDivElement | null) => { ctx.highlightRef.current = el } },
      )}
    >
      {children}
    </div>
  )
}

export interface XhExpressionInputHighlightSegmentProps extends ComponentPropsWithRef<'span'> {
  /** 在 segments 里的序号。 */
  index: string
}
/** 镜像层里的一段。 */
export function XhExpressionInputHighlightSegment({ index, children, ...rest }: XhExpressionInputHighlightSegmentProps): ReactNode {
  const ctx = useExpressionInputContext()
  const segment = ctx.api.segments[Number(index)]
  if (!segment)
    return null
  return <span {...mergeReactProps(ctx.api.getHighlightSegmentProps({ segment }), rest)}>{children}</span>
}

export interface XhExpressionInputPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 */
  container?: () => Element | null
}
/** 迁移到浮层落点：留在原地时，宿主祖先只要建立了层叠上下文就能遮住浮层。 */
export function XhExpressionInputPositioner({ children, container, ...rest }: XhExpressionInputPositionerProps): ReactNode {
  const ctx = useExpressionInputContext()
  const bars = useScrollbars({ scrollable: () => ctx.contentRef.current, props: () => ({ size: 'sm' }) })
  return (
    <XhPortal container={container ?? ctx.portalContainer} source={ctx.inputRef} present={ctx.rendered}>
      <div
        {...mergeReactProps(
          ctx.api.getPositionerProps(),
          rest,
          { ref: (el: HTMLDivElement | null) => { ctx.positionerRef.current = el } },
        )}
      >
        {children}
        {bars.render()}
      </div>
    </XhPortal>
  )
}

export interface XhExpressionInputContentProps extends ComponentPropsWithRef<'div'> {}
export function XhExpressionInputContent({ children, ...rest }: XhExpressionInputContentProps): ReactNode {
  const ctx = useExpressionInputContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getContentProps(),
        rest,
        {
          style: ctx.rendered ? undefined : { display: 'none' },
          ref: (el: HTMLDivElement | null) => { ctx.contentRef.current = el },
        },
      )}
    >
      {children}
    </div>
  )
}

export interface XhExpressionInputItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** 条目的 key。 */
  value: string
}
/** 一条补全。 */
export function XhExpressionInputItem({ value, children, ...rest }: XhExpressionInputItemProps): ReactNode {
  const ctx = useExpressionInputContext()
  const item = ctx.api.items.find(candidate => candidate.key === value)
  if (!item)
    return null
  return (
    <ExpressionInputItemProvider value={item}>
      <div {...mergeReactProps(ctx.api.getItemProps({ item }), rest)}>{children}</div>
    </ExpressionInputItemProvider>
  )
}

type ItemPartProps = Omit<ComponentPropsWithRef<'span'>, 'value'> & { value?: string }

function useItemPart(rest: Record<string, unknown>, props: (api: ExpressionInputApi, item: ExpressionInputItem) => unknown): Record<string, unknown> {
  const ctx = useExpressionInputContext()
  const item = useExpressionInputItemContext()
  return mergeReactProps(props(ctx.api, item) as Record<string, unknown>, rest)
}

export interface XhExpressionInputItemPrefixProps extends ItemPartProps {}
/** 条目种类小标（变量 / 函数），对读屏隐藏。 */
export function XhExpressionInputItemPrefix({ children, value: _value, ...rest }: XhExpressionInputItemPrefixProps): ReactNode {
  return <span {...useItemPart(rest, (api, item) => api.getItemPrefixProps({ item }))}>{children}</span>
}

export interface XhExpressionInputItemTextProps extends ItemPartProps {}
export function XhExpressionInputItemText({ children, value: _value, ...rest }: XhExpressionInputItemTextProps): ReactNode {
  return <span {...useItemPart(rest, (api, item) => api.getItemTextProps({ item }))}>{children}</span>
}

export interface XhExpressionInputItemSuffixProps extends ItemPartProps {}
/** 名字后面的提示：函数是签名。 */
export function XhExpressionInputItemSuffix({ children, value: _value, ...rest }: XhExpressionInputItemSuffixProps): ReactNode {
  return <span {...useItemPart(rest, (api, item) => api.getItemSuffixProps({ item }))}>{children}</span>
}

export interface XhExpressionInputItemDescriptionProps extends ItemPartProps {}
/** 条目的第 2 行说明。 */
export function XhExpressionInputItemDescription({ children, value: _value, ...rest }: XhExpressionInputItemDescriptionProps): ReactNode {
  return <span {...useItemPart(rest, (api, item) => api.getItemDescriptionProps({ item }))}>{children}</span>
}

export interface XhExpressionInputEmptyProps extends ComponentPropsWithRef<'div'> {}
/** 没有匹配的补全时显示的空态；与 content 同级。 */
export function XhExpressionInputEmpty({ children, ...rest }: XhExpressionInputEmptyProps): ReactNode {
  const ctx = useExpressionInputContext()
  return <div {...mergeReactProps(ctx.api.getEmptyProps(), rest)}>{children}</div>
}

export interface XhExpressionInputIssuesProps extends ComponentPropsWithRef<'div'> {}
/** 问题列表；渲染了它，输入框的描述链才引用它。 */
export function XhExpressionInputIssues({ children, ...rest }: XhExpressionInputIssuesProps): ReactNode {
  const ctx = useExpressionInputContext()
  const { registerIssues } = ctx
  useEffect(() => registerIssues(), [registerIssues])
  return <div {...mergeReactProps(ctx.api.getIssuesProps(), rest)}>{children}</div>
}

export interface XhExpressionInputIssueProps extends ComponentPropsWithRef<'p'> {
  /** 在 issues 里的序号。 */
  index: string
}
/** 问题列表里的一行。 */
export function XhExpressionInputIssue({ index, children, ...rest }: XhExpressionInputIssueProps): ReactNode {
  const ctx = useExpressionInputContext()
  const issue = ctx.api.issues[Number(index)]
  if (!issue)
    return null
  return <p {...mergeReactProps(ctx.api.getIssueProps({ issue }), rest)}>{children}</p>
}

/** 标准结构里各部件对应的组件。 */
const EXPRESSION_INPUT_PARTS = {
  'label': XhExpressionInputLabel,
  'control': XhExpressionInputControl,
  'input': XhExpressionInputInput,
  'highlight': XhExpressionInputHighlight,
  'highlight-segment': XhExpressionInputHighlightSegment,
  'positioner': XhExpressionInputPositioner,
  'content': XhExpressionInputContent,
  'item': XhExpressionInputItem,
  'item-prefix': XhExpressionInputItemPrefix,
  'item-text': XhExpressionInputItemText,
  'item-suffix': XhExpressionInputItemSuffix,
  'item-description': XhExpressionInputItemDescription,
  'empty': XhExpressionInputEmpty,
  'issues': XhExpressionInputIssues,
  'issue': XhExpressionInputIssue,
}

/**
 * 未写 children 时铺开的整套结构：照 headless 的 expressionInputStructure 渲，
 * 与 Web Components 只写 root 时元素生成的节点出自同一份。
 */
function renderDefaultStructure(api: ExpressionInputApi, label: string | undefined, multiline: boolean): ReactNode[] {
  return renderStructure(expressionInputStructure(api, { label, multiline }), EXPRESSION_INPUT_PARTS)
}
