/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 mention 相关实现。

import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type { MentionApi, MentionInputEl, MentionInputHost, MentionNode, MentionNodeMeta, MentionSchema, MentionTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { mentionStructure } from '@xihan-ui/headless'
import { useEffect, useMemo } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { MentionItemProvider, MentionProvider, useMentionContext, useMentionItemContext } from './context'
import { useMention } from './use-mention'

type MentionProps = MentionSchema['props']

/** 函数式 children 的载荷：浮层开合、正文与查询串、高亮候选、正文里仍然完整的提及，以及改写正文与收起浮层的句柄。 */
export type MentionRootSlotProps = Pick<
  MentionApi,
  | 'open'
  | 'value'
  | 'query'
  | 'activePrefix'
  | 'highlightedValue'
  | 'mentions'
  | 'setValue'
  | 'close'
>

/** 根上自有的取值；defaultValue 与 dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue' | 'dir'>

export interface XhMentionRootProps extends RootElementProps {
  /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
  ariaLabel?: string
  /** 打开候选的前缀字符，默认 '@'；传数组即多种前缀并存。 */
  triggerPrefix?: string | string[]
  collection?: MentionNode[]
  /** 标题。不给 children 时铺 label 部件。 */
  label?: ReactNode
  /** 不给 children 时输入框铺成多行的 textarea；给了 children 时在 XhMentionInput 上写 as="textarea"。 */
  multiline?: boolean
  value?: string
  defaultValue?: string
  disabled?: boolean
  loading?: boolean
  /** 表单字段名；提供后输入框才带 name，整段正文随表单一并提交。 */
  name?: string
  readOnly?: boolean
  invalid?: boolean
  placeholder?: string
  loop?: boolean
  placement?: Placement
  offset?: number
  /** 文字方向；浮层迁移到落点后无法继承作者子树上的方向，需要 RTL 时显式提供。 */
  dir?: Direction
  translations?: MentionTranslations
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  onValueChange?: MentionProps['onValueChange']
  onQueryChange?: MentionProps['onQueryChange']
  onItemSelect?: MentionProps['onItemSelect']
  onOpenChange?: MentionProps['onOpenChange']
  /** 铺开 collection 时每条候选的内容；未提供时使用 collection 中的 label。 */
  renderItem?: (node: MentionNodeMeta) => ReactNode
  /** 只接管条目行首那一格；其余槽仍由数据铺。 */
  renderItemPrefix?: (node: MentionNodeMeta) => ReactNode
  /** 只接管条目行尾那一格；其余槽仍由数据铺。 */
  renderItemSuffix?: (node: MentionNodeMeta) => ReactNode
  /** 铺开 collection 时空态中的文案；未写时取 translations.empty（缺省走英文语言包）。 */
  empty?: ReactNode
  children?: SlotChildren<MentionRootSlotProps>
}

export function XhMentionRoot({
  ariaLabel,
  triggerPrefix,
  collection,
  label,
  multiline,
  value,
  defaultValue,
  disabled,
  loading,
  name,
  readOnly,
  invalid,
  placeholder,
  loop,
  placement,
  offset,
  dir,
  translations,
  variant,
  tone,
  size,
  onValueChange,
  onQueryChange,
  onItemSelect,
  onOpenChange,
  children,
  renderItem,
  renderItemPrefix,
  renderItemSuffix,
  empty,
  ...rest
}: XhMentionRootProps): ReactNode {
  const machineProps = {
    ariaLabel,
    triggerPrefix,
    collection,
    value,
    defaultValue,
    disabled,
    loading,
    name,
    readOnly,
    invalid,
    placeholder,
    loop,
    placement,
    offset,
    dir,
    translations,
    variant,
    tone,
    size,
    onValueChange,
    onQueryChange,
    onItemSelect,
    onOpenChange,
  }
  const ctx = useMention(withXhConfig('mention', useFormControlProps(machineProps)) as MentionProps)
  const api = ctx.api

  // 首帧结算一次候选条数，之后的增删由条目自己上报
  const { syncItems } = ctx
  useEffect(syncItems)

  const body = children != null
    ? renderSlot(children, {
        open: api.open,
        value: api.value,
        query: api.query,
        activePrefix: api.activePrefix,
        highlightedValue: api.highlightedValue,
        mentions: api.mentions,
        setValue: api.setValue,
        close: api.close,
      })
    : renderDefaultStructure(api, { label, multiline, empty, renderItem, renderItemPrefix, renderItemSuffix })

  return (
    <MentionProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {body}
      </div>
    </MentionProvider>
  )
}

XhMentionRoot.xhEvents = ['value-change', 'query-change', 'item-select', 'open-change'] as const

export interface XhMentionLabelProps extends ComponentPropsWithRef<'label'> {}
/** 使用原生 label，connect 给出的 for 恒指向输入框。 */
export function XhMentionLabel({ children, ...rest }: XhMentionLabelProps): ReactNode {
  const ctx = useMentionContext()
  // 渲出来了才登记：可聚焦部件的 aria-labelledby 只在这个节点真在场时才指过来
  const { registerLabel } = ctx
  useEffect(() => registerLabel(), [registerLabel])
  return <label {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</label>
}

/** 多行宿主另认 textarea 自己的几个排版属性（起始行数、列数与折行方式）。 */
export interface XhMentionInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue'>, Pick<ComponentPropsWithRef<'textarea'>, 'rows' | 'cols' | 'wrap'> {
  /**
   * 输入框渲染为哪个标签，默认 input。
   * 写 textarea 即多行宿主：正文可以换行，connect 随之撤销 type、role 与 aria-expanded。
   */
  as?: MentionInputHost
}
/** 输入框；正文写在它上面，候选浮层贴着它落位。缺省单行，写 as="textarea" 即多行。 */
export function XhMentionInput({ as = 'input', ...rest }: XhMentionInputProps): ReactNode {
  const ctx = useMentionContext()
  // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
  const fieldWiring = useFieldStateWiring()
  // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
  const fieldLabel = useFieldLabelWiring()
  const props = mergeReactProps(
    fieldLabel({ ...fieldWiring, ...ctx.api.getInputProps({ as }) as Record<string, unknown> }),
    rest as Record<string, unknown>,
    { ref: (el: MentionInputEl | null) => { ctx.inputRef.current = el } },
  )
  // 自己渲染宿主节点，label 的 for 指向它
  return as === 'textarea'
    ? <textarea {...props as ComponentPropsWithRef<'textarea'>} />
    : <input {...props as ComponentPropsWithRef<'input'>} />
}

export interface XhMentionPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 */
  container?: () => Element | null
}
/** 迁移到浮层落点：留在原地时，宿主祖先只要建立了层叠上下文就能遮住浮层。 */
export function XhMentionPositioner({ children, container, ...rest }: XhMentionPositionerProps): ReactNode {
  const ctx = useMentionContext()
  // 候选列表的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner，条子走浮层 4px 档
  const bars = useScrollbars({ scrollable: () => ctx.contentRef.current, props: () => ({ size: 'sm' }) })
  return (
    <XhPortal container={container ?? ctx.portalContainer} source={ctx.inputRef} present={ctx.rendered}>
      <div
        {...mergeReactProps(
          ctx.api.getPositionerProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.positionerRef.current = el } },
        )}
      >
        {children}
        {bars.render()}
      </div>
    </XhPortal>
  )
}

export interface XhMentionContentProps extends ComponentPropsWithRef<'div'> {}
export function XhMentionContent({ children, ...rest }: XhMentionContentProps): ReactNode {
  const ctx = useMentionContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getContentProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        {
          // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
          // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
          style: ctx.rendered ? undefined : { display: 'none' },
          ref: (el: HTMLDivElement | null) => { ctx.contentRef.current = el },
        },
      )}
    >
      {children}
    </div>
  )
}

export interface XhMentionEmptyProps extends ComponentPropsWithRef<'div'> {}
/** 没有任何候选时显示的空态；与候选面板同级，不进入 role=listbox。 */
export function XhMentionEmpty({ children, ...rest }: XhMentionEmptyProps): ReactNode {
  const ctx = useMentionContext()
  return <div {...mergeReactProps(ctx.api.getEmptyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhMentionLoadingProps extends ComponentPropsWithRef<'div'> {}
/** 候选仍在获取时显示的在途占位；与候选面板同级。 */
export function XhMentionLoading({ children, ...rest }: XhMentionLoadingProps): ReactNode {
  const ctx = useMentionContext()
  return <div {...mergeReactProps(ctx.api.getLoadingProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhMentionItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
  /** 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 */
  disabled?: boolean
}
export function XhMentionItem({ value, disabled, children, ...rest }: XhMentionItemProps): ReactNode {
  const ctx = useMentionContext()
  const item = useMemo(() => ({ value, disabled }), [value, disabled])

  // 候选的进出由条目自己上报，机器据此结算条数并摘掉悬空高亮；
  // 节点就地复用时数量不变但身份换了，跟着 value 再报一次
  const { syncItems } = ctx
  useEffect(() => {
    syncItems()
    return syncItems
  }, [syncItems, value])

  return (
    <MentionItemProvider value={item}>
      <div {...mergeReactProps(ctx.api.getItemProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </MentionItemProvider>
  )
}

export interface XhMentionItemTextProps extends ComponentPropsWithRef<'span'> {}
export function XhMentionItemText({ children, ...rest }: XhMentionItemTextProps): ReactNode {
  const ctx = useMentionContext()
  const item = useMentionItemContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/** 条目行首的作者内容（图标、色块、头像），对读屏隐藏。 */
export interface XhMentionItemPrefixProps extends ComponentPropsWithRef<'span'> {}
export function XhMentionItemPrefix({ children, ...rest }: XhMentionItemPrefixProps): ReactNode {
  const ctx = useMentionContext()
  const item = useMentionItemContext()
  return <span {...mergeReactProps(ctx.api.getItemPrefixProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/** 条目行尾的作者内容（计数、徽标）。 */
export interface XhMentionItemSuffixProps extends ComponentPropsWithRef<'span'> {}
export function XhMentionItemSuffix({ children, ...rest }: XhMentionItemSuffixProps): ReactNode {
  const ctx = useMentionContext()
  const item = useMentionItemContext()
  return <span {...mergeReactProps(ctx.api.getItemSuffixProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/** 条目的第 2 行副文本，跨文字槽、走 muted 档。 */
export interface XhMentionItemDescriptionProps extends ComponentPropsWithRef<'span'> {}
export function XhMentionItemDescription({ children, ...rest }: XhMentionItemDescriptionProps): ReactNode {
  const ctx = useMentionContext()
  const item = useMentionItemContext()
  return <span {...mergeReactProps(ctx.api.getItemDescriptionProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/** 标准结构里各部件对应的组件。 */
const MENTION_PARTS = {
  'label': XhMentionLabel,
  'input': XhMentionInput,
  'positioner': XhMentionPositioner,
  'content': XhMentionContent,
  'item': XhMentionItem,
  'item-prefix': XhMentionItemPrefix,
  'item-text': XhMentionItemText,
  'item-description': XhMentionItemDescription,
  'item-suffix': XhMentionItemSuffix,
  'empty': XhMentionEmpty,
  'loading': XhMentionLoading,
}

/** 多行形态的输入框：标准结构开了 multiline 时顶替 input 部件。 */
function MentionTextarea(props: Omit<XhMentionInputProps, 'as'>): ReactNode {
  return <XhMentionInput {...props} as="textarea" />
}

interface MentionStructureContent {
  label?: ReactNode
  multiline?: boolean
  empty?: ReactNode
  renderItem?: (node: MentionNodeMeta) => ReactNode
  renderItemPrefix?: (node: MentionNodeMeta) => ReactNode
  renderItemSuffix?: (node: MentionNodeMeta) => ReactNode
}

/**
 * 未写 children 时铺开的整套结构，作者只提供数据：照 headless 的 mentionStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。文字以外的标题、空态、候选文字与行首行尾由对应渲染函数接管；
 * 开了 multiline 时输入框是 textarea。
 * 过滤仍归调用方：collection 就是当前应显示的候选。
 */
function renderDefaultStructure(api: MentionApi, content: MentionStructureContent): ReactNode[] {
  const { label, empty, renderItem, renderItemPrefix, renderItemSuffix } = content
  const slotted: Readonly<Record<string, boolean>> = {
    'label': label != null && typeof label !== 'string',
    'empty': empty != null && typeof empty !== 'string',
    'item': renderItem != null,
    'item-prefix': renderItemPrefix != null,
    'item-suffix': renderItemSuffix != null,
  }
  const nodes = mentionStructure(api, {
    label: typeof label === 'string' ? label : undefined,
    empty: typeof empty === 'string' ? empty : undefined,
    multiline: content.multiline,
    slotted: name => slotted[name] === true,
  })
  const parts = content.multiline ? { ...MENTION_PARTS, input: MentionTextarea } : MENTION_PARTS
  return renderStructure(nodes, parts, (node) => {
    const meta = node.data as MentionNodeMeta
    switch (node.slot?.name) {
      case 'label':
        return label
      case 'empty':
        return empty
      case 'item':
        return renderItem?.(meta) ?? meta.label
      case 'item-prefix':
        return renderItemPrefix?.(meta)
      case 'item-suffix':
        return renderItemSuffix?.(meta)
      default:
        return undefined
    }
  })
}
