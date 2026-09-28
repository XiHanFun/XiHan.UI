/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 markdown stream 相关实现。

import type { Size } from '@xihan-ui/core'
import type { MarkdownBlock, MarkdownInlineMount, MarkdownStreamApi, MarkdownStreamProps, MarkdownStreamTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { markdownBlockHtml, queryMarkdownInlines, sameMarkdownInlines } from '@xihan-ui/headless'
import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { withXhConfig } from '../../config/config'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { MarkdownStreamProvider, useMarkdownStreamContext } from './context'
import { useMarkdownStream } from './use-markdown-stream'

/** 函数式 children 的载荷：块列表与流式状态，以及完成后要播报的文案。 */
export type MarkdownStreamRootSlotProps = Pick<MarkdownStreamApi, 'blocks' | 'streaming' | 'announcement'>

/** 逐块 children 的载荷。作者据此接管代码块与公式块。 */
export interface MarkdownStreamBlockSlotProps {
  block: MarkdownBlock
  /** 0 基块下标。 */
  index: number
}

/** 根上自有的取值。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children'>

export interface XhMarkdownStreamRootProps extends RootElementProps {
  /** 已渲染好的块列表。 */
  blocks?: readonly MarkdownBlock[]
  /** 该段正文是否仍在增长，只写 data-streaming。 */
  streaming?: boolean
  /** 播报档位，默认 off。 */
  announce?: 'off' | 'polite' | 'assertive'
  /** 是否绘制流式光标，默认绘制。 */
  caret?: boolean
  /** 尺寸：sm / md / lg。 */
  size?: Size
  translations?: Partial<MarkdownStreamTranslations>
  children?: SlotChildren<MarkdownStreamRootSlotProps>
}

export function XhMarkdownStreamRoot({
  blocks,
  streaming,
  announce,
  caret,
  size,
  translations,
  children,
  ...rest
}: XhMarkdownStreamRootProps): ReactNode {
  const configured = withXhConfig('markdown-stream', { blocks, streaming, announce, caret, size, translations })
  const ctx = useMarkdownStream({ ...configured, blocks: configured.blocks ?? [] } as MarkdownStreamProps)
  const { api } = ctx
  return (
    <MarkdownStreamProvider value={ctx}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {renderSlot(children, { blocks: api.blocks, streaming: api.streaming, announcement: api.announcement })}
      </div>
    </MarkdownStreamProvider>
  )
}

/** 行内引用的渲染载荷：正文里 [@来源] 写成的一处引用，渲进 html 里的占位节点。 */
export interface MarkdownStreamCitationSlotProps {
  /** 这一处引用的来源 id，按书写顺序排；一处多源时不止一个。 */
  sourceIds: readonly string[]
  block: MarkdownBlock
  /** 该挂点在块内的 0 基下标。 */
  index: number
}

/** 行内公式的渲染载荷：交给宿主的公式引擎渲染。 */
export interface MarkdownStreamMathSlotProps {
  /** 未经转义的 TeX 原文。 */
  source: string
  /** 行内写的 `$$…$$` 为真。 */
  display: boolean
  block: MarkdownBlock
  /** 该挂点在块内的 0 基下标。 */
  index: number
}

export interface XhMarkdownStreamContentProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 逐块接管该块的正文；未提供时按块类型铺设。 */
  children?: SlotChildren<MarkdownStreamBlockSlotProps>
  /** 渲染行内引用：渲进 html 里的占位节点，未提供时占位节点显示来源 id。 */
  renderCitation?: (props: MarkdownStreamCitationSlotProps) => ReactNode
  /** 渲染行内公式：渲进 html 里的占位节点，未提供时占位节点显示 TeX 原文。 */
  renderMath?: (props: MarkdownStreamMathSlotProps) => ReactNode
}
/** 块是数据铺设出来的，作者无法写出 N 个节点，由组件铺设。 */
export function XhMarkdownStreamContent({ children, renderCitation, renderMath, ...rest }: XhMarkdownStreamContentProps): ReactNode {
  const ctx = useMarkdownStreamContext()
  const { api } = ctx
  const host = useRef<HTMLDivElement | null>(null)
  const [mounts, setMounts] = useState<readonly MarkdownInlineMount[]>([])
  const cleared = useRef(new WeakSet<HTMLElement>())
  // dangerouslySetInnerHTML 按对象身份比：每轮新建 { __html } 会让 React 每轮重铺 html，
  // 选区、作者挂进占位节点的角标都会被冲掉。内容没变就沿用上一轮那个对象
  const htmlProps = useRef(new Map<string, { __html: string }>())
  const htmlProp = (key: string, html: string): { __html: string } => {
    const cached = htmlProps.current.get(key)
    if (cached !== undefined && cached.__html === html)
      return cached
    const next = { __html: html }
    htmlProps.current.set(key, next)
    return next
  }
  useIsomorphicLayoutEffect(() => {
    const live = new Set(api.blocks.map(block => block.key))
    for (const key of htmlProps.current.keys()) {
      if (!live.has(key))
        htmlProps.current.delete(key)
    }
  })
  // 占位节点是 html 铺进去之后才有的：每次提交后重新找一遍，指向的节点变了才重渲
  useIsomorphicLayoutEffect(() => {
    const el = host.current
    const next = el && (renderCitation || renderMath)
      ? queryMarkdownInlines(el, api.blocks)
          .filter(mount => (mount.inline.kind === 'citation' ? renderCitation : renderMath) !== undefined)
      : []
    // 由作者接管的占位节点先清掉降级内容，渲进来的节点是它唯一的内容
    for (const mount of next) {
      if (!cleared.current.has(mount.element)) {
        mount.element.textContent = ''
        cleared.current.add(mount.element)
      }
    }
    setMounts(prev => (sameMarkdownInlines(prev, next) ? prev : next))
  })
  return (
    <div {...mergeReactProps(api.getContentProps() as Record<string, unknown>, { ref: host }, rest as Record<string, unknown>)}>
      {api.blocks.map((block, index) => {
        const attrs = api.getBlockProps({ block }) as Record<string, unknown>
        if (children !== undefined)
          return <div key={block.key} {...attrs}>{renderSlot(children, { block, index })}</div>
        const html = markdownBlockHtml(block)
        // markdown 块直接铺已消毒的 html；代码与公式块没人接管就把原文当正文显示
        return html === undefined
          ? <div key={block.key} {...attrs}>{block.source ?? ''}</div>
          : <div key={block.key} {...attrs} dangerouslySetInnerHTML={htmlProp(block.key, html)} />
      })}
      {mounts.map(({ key, element, inline, block, index }) => createPortal(
        inline.kind === 'citation'
          ? renderCitation?.({ sourceIds: inline.sourceIds, block, index })
          : renderMath?.({ source: inline.source, display: inline.display, block, index }),
        element,
        key,
      ))}
    </div>
  )
}

export interface XhMarkdownStreamLiveRegionProps extends ComponentPropsWithRef<'div'> {}
export function XhMarkdownStreamLiveRegion({ children, ...rest }: XhMarkdownStreamLiveRegionProps): ReactNode {
  const ctx = useMarkdownStreamContext()
  return (
    <div {...mergeReactProps(ctx.api.getLiveRegionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? ctx.api.announcement}
    </div>
  )
}
