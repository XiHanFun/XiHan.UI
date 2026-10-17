/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 accordion 相关实现。

import type { ControlVariant, Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { AccordionApi, AccordionNode, AccordionNodeMeta, AccordionSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { accordionStructure } from '@xihan-ui/headless'
import { useMemo, useRef } from 'react'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderStructure } from '../../runtime/structure'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { AccordionItemProvider, AccordionProvider, useAccordionContext, useAccordionItemContext } from './context'
import { useAccordion } from './use-accordion'

type AccordionProps = AccordionSchema['props']

/** 根上自有的取值；dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'dir'>

export interface XhAccordionRootProps extends RootElementProps {
  collection?: AccordionNode[]
  value?: string[]
  defaultValue?: string[]
  multiple?: boolean
  collapsible?: boolean
  loop?: boolean
  disabled?: boolean
  variant?: ControlVariant
  orientation?: Orientation
  /** 只改变水平轴上左右键的语义，不写入 DOM。 */
  dir?: Direction
  tone?: Tone
  size?: Size
  /** 条目内容第一次展开时才挂载。 */
  lazyMount?: boolean
  /** 收起动画播完后卸载条目内容，再展开时重新挂载。 */
  unmountOnExit?: boolean
  /** 条目正文的角色：region 是地标（默认），group 不进地标导航。 */
  contentRole?: AccordionProps['contentRole']
  onValueChange?: AccordionProps['onValueChange']
  /** 每个条目正文的自定义内容；未提供时使用 collection 中的 content。 */
  renderContent?: (node: AccordionNodeMeta) => ReactNode
  children?: ReactNode
}

export function XhAccordionRoot({
  collection,
  value,
  defaultValue,
  multiple,
  collapsible,
  loop,
  disabled,
  variant,
  orientation,
  dir,
  tone,
  size,
  lazyMount,
  unmountOnExit,
  contentRole,
  onValueChange,
  renderContent,
  children,
  ...rest
}: XhAccordionRootProps): ReactNode {
  const ctx = useAccordion({
    collection,
    value,
    defaultValue,
    multiple,
    collapsible,
    loop,
    disabled,
    variant,
    orientation,
    dir,
    tone,
    size,
    lazyMount,
    unmountOnExit,
    contentRole,
    onValueChange,
  } as AccordionProps)
  const body = children ?? renderDefaultStructure(ctx.api, renderContent)
  return (
    <AccordionProvider value={ctx}>
      <div {...mergeReactProps(ctx.api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {body}
      </div>
    </AccordionProvider>
  )
}

XhAccordionRoot.xhEvents = ['value-change'] as const

export interface XhAccordionItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
  /** 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 */
  disabled?: boolean
}
export function XhAccordionItem({ value, disabled, children, ...rest }: XhAccordionItemProps): ReactNode {
  const ctx = useAccordionContext()
  const item = useMemo(() => ({ value, disabled }), [value, disabled])
  return (
    <AccordionItemProvider value={item}>
      <div {...mergeReactProps(ctx.api.getItemProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </AccordionItemProvider>
  )
}

export interface XhAccordionItemSeparatorProps extends ComponentPropsWithRef<'div'> {}
/** 条目之间的分隔线，纯视觉；不渲染它时条目直接相邻。 */
export function XhAccordionItemSeparator({ children, ...rest }: XhAccordionItemSeparatorProps): ReactNode {
  const ctx = useAccordionContext()
  return <div {...mergeReactProps(ctx.api.getItemSeparatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhAccordionHeaderProps extends ComponentPropsWithRef<'h3'> {}
/** 渲染为 h3，与 connect 给出的 aria-level 对齐。 */
export function XhAccordionHeader({ children, ...rest }: XhAccordionHeaderProps): ReactNode {
  const ctx = useAccordionContext()
  const item = useAccordionItemContext()
  return <h3 {...mergeReactProps(ctx.api.getHeaderProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</h3>
}

export interface XhAccordionTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhAccordionTrigger({ children, ...rest }: XhAccordionTriggerProps): ReactNode {
  const ctx = useAccordionContext()
  const item = useAccordionItemContext()
  return <button {...mergeReactProps(ctx.api.getTriggerProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhAccordionContentProps extends ComponentPropsWithRef<'div'> {}
export function XhAccordionContent({ children, ...rest }: XhAccordionContentProps): ReactNode {
  const ctx = useAccordionContext()
  const item = useAccordionItemContext()
  const contentRef = useRef<HTMLElement | null>(null)
  // 闸门按面板各开一个：手风琴模式下切换项时，一个进场一个退场是同时发生的
  const visible = useOverlayExit({
    config: ctx.config,
    isOpen: () => ctx.api.isOpen(item.value),
    contentRef,
  })
  return (
    <div
      {...mergeReactProps(
        ctx.api.getContentProps(item) as Record<string, unknown>,
        rest as Record<string, unknown>,
        {
          // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
          // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
          style: visible ? undefined : { display: 'none' },
          ref: (el: HTMLDivElement | null) => { contentRef.current = el },
        },
      )}
    >
      {ctx.api.isContentMounted(item, visible) ? children : null}
    </div>
  )
}

export interface XhAccordionIndicatorProps extends ComponentPropsWithRef<'span'> {}
export function XhAccordionIndicator({ children, ...rest }: XhAccordionIndicatorProps): ReactNode {
  const ctx = useAccordionContext()
  const item = useAccordionItemContext()
  return <span {...mergeReactProps(ctx.api.getIndicatorProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/** 标准结构里各部件对应的组件。 */
const ACCORDION_PARTS = {
  item: XhAccordionItem,
  header: XhAccordionHeader,
  trigger: XhAccordionTrigger,
  indicator: XhAccordionIndicator,
  content: XhAccordionContent,
}

/**
 * 未写 children 时照 accordionStructure 铺开的整套结构，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 正文默认取 node.content，提供 renderContent 即由作者接管；挂不挂由正文部件自己按挂载判定决定。
 */
function renderDefaultStructure(api: AccordionApi, renderContent?: (node: AccordionNodeMeta) => ReactNode): ReactNode[] {
  const nodes = accordionStructure(api, { slotted: name => name === 'content' && renderContent != null })
  return renderStructure(nodes, ACCORDION_PARTS, node =>
    node.slot?.name === 'content' ? renderContent?.(node.data as AccordionNodeMeta) ?? (node.data as AccordionNodeMeta).content : undefined)
}
