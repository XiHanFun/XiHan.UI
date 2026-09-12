import type { Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { AccordionNode, AccordionNodeMeta, AccordionSchema, AccordionVariant } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { useMemo, useRef } from 'react'
import { mergeReactProps } from '../../runtime/merge-props'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { AccordionItemProvider, AccordionProvider, useAccordionContext, useAccordionItemContext } from './context'
import { useAccordion } from './use-accordion'

type AccordionProps = AccordionSchema['props']

/** 根上自有的那些取值；dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'dir'>

export interface XhAccordionRootProps extends RootElementProps {
  collection?: AccordionNode[]
  value?: string[]
  defaultValue?: string[]
  multiple?: boolean
  collapsible?: boolean
  loop?: boolean
  disabled?: boolean
  variant?: AccordionVariant
  orientation?: Orientation
  /** 只改水平轴上左右键的语义，不写进 DOM。 */
  dir?: Direction
  tone?: Tone
  size?: Size
  onValueChange?: AccordionProps['onValueChange']
  /** 每个条目正文的自定义内容；不给就用 collection 里的 content。 */
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
    onValueChange,
  } as AccordionProps)
  const body = children ?? (collection
    ? <DefaultTree collection={ctx.api.collection} renderContent={renderContent} />
    : null)
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
  /** 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用。 */
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
/** 条目之间的那条细线，纯视觉；不渲染它时条目直接相邻。 */
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
      {children}
    </div>
  )
}

export interface XhAccordionIndicatorProps extends ComponentPropsWithRef<'span'> {}
export function XhAccordionIndicator({ children, ...rest }: XhAccordionIndicatorProps): ReactNode {
  const ctx = useAccordionContext()
  const item = useAccordionItemContext()
  return <span {...mergeReactProps(ctx.api.getIndicatorProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/**
 * 没写 children 时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写 children，行为不变。
 * 正文默认取 node.content，给了 renderContent 即由作者接管。
 */
function DefaultTree(props: {
  collection: readonly AccordionNodeMeta[]
  renderContent?: (node: AccordionNodeMeta) => ReactNode
}): ReactNode {
  return (
    <>
      {props.collection.map(node => (
        <XhAccordionItem key={node.value} value={node.value}>
          <XhAccordionHeader>
            <XhAccordionTrigger>
              <span>{node.label}</span>
              <XhAccordionIndicator />
            </XhAccordionTrigger>
          </XhAccordionHeader>
          <XhAccordionContent>{props.renderContent?.(node) ?? node.content ?? ''}</XhAccordionContent>
        </XhAccordionItem>
      ))}
    </>
  )
}
