import type { Size } from '@xihan-ui/core'
import type { MarkdownBlock, MarkdownStreamApi, MarkdownStreamProps, MarkdownStreamTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { markdownBlockHtml } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { MarkdownStreamProvider, useMarkdownStreamContext } from './context'
import { useMarkdownStream } from './use-markdown-stream'

/** 函数式 children 的载荷：块列表与流式状态，以及写好之后要播报的那句话。 */
export type MarkdownStreamRootSlotProps = Pick<MarkdownStreamApi, 'blocks' | 'streaming' | 'announcement'>

/** 逐块 children 的载荷。作者据此把代码块与公式块接管过去。 */
export interface MarkdownStreamBlockSlotProps {
  block: MarkdownBlock
  /** 0 基块下标。 */
  index: number
}

export interface XhMarkdownStreamRootProps {
  /** 已渲染好的块列表。 */
  blocks?: readonly MarkdownBlock[]
  /** 这一段正文是否仍在增长，只落 data-streaming。 */
  streaming?: boolean
  /** 播报档位，默认 off。 */
  announce?: 'off' | 'polite' | 'assertive'
  /** 画不画流式光标，默认画。 */
  caret?: boolean
  /** 尺寸：sm / md / lg。 */
  size?: Size
  translations?: Partial<MarkdownStreamTranslations>
  children?: SlotChildren<MarkdownStreamRootSlotProps>
}

export function XhMarkdownStreamRoot({ children, ...props }: XhMarkdownStreamRootProps): ReactNode {
  const configured = withXhConfig('markdown-stream', props) as XhMarkdownStreamRootProps
  const ctx = useMarkdownStream({ ...configured, blocks: configured.blocks ?? [] } as MarkdownStreamProps)
  const { api } = ctx
  return (
    <MarkdownStreamProvider value={ctx}>
      <div {...api.getRootProps() as Record<string, unknown>}>
        {renderSlot(children, { blocks: api.blocks, streaming: api.streaming, announcement: api.announcement })}
      </div>
    </MarkdownStreamProvider>
  )
}

export interface XhMarkdownStreamContentProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 逐块接管这一块的正文；不给就按块类型铺。 */
  children?: SlotChildren<MarkdownStreamBlockSlotProps>
}
/** 块是数据铺出来的，作者写不出 N 个节点，由组件铺。 */
export function XhMarkdownStreamContent({ children, ...rest }: XhMarkdownStreamContentProps): ReactNode {
  const ctx = useMarkdownStreamContext()
  const { api } = ctx
  return (
    <div {...mergeReactProps(api.getContentProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {api.blocks.map((block, index) => {
        const attrs = api.getBlockProps({ block }) as Record<string, unknown>
        if (children !== undefined)
          return <div key={block.key} {...attrs}>{renderSlot(children, { block, index })}</div>
        const html = markdownBlockHtml(block)
        // markdown 块直接铺已消毒的 html；代码与公式块没人接管就把原文当正文显示
        return html === undefined
          ? <div key={block.key} {...attrs}>{block.source ?? ''}</div>
          : <div key={block.key} {...attrs} dangerouslySetInnerHTML={{ __html: html }} />
      })}
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
