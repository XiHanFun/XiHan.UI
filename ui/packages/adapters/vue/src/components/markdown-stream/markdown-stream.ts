import type { Size } from '@xihan-ui/core'
import type { MarkdownBlock, MarkdownStreamApi, MarkdownStreamProps, MarkdownStreamTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import { markdownBlockHtml } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideMarkdownStream, useMarkdownStreamContext } from './context'
import { useMarkdownStream } from './use-markdown-stream'

/** 默认插槽的载荷：块列表与流式状态，以及写好之后要播报的那句话。 */
export type MarkdownStreamRootSlotProps = Pick<MarkdownStreamApi, 'blocks' | 'streaming' | 'announcement'>

/** 逐块插槽的载荷。作者据此把代码块与公式块接管过去。 */
export interface MarkdownStreamBlockSlotProps {
  block: MarkdownBlock
  /** 0 基块下标。 */
  index: number
}

export const XhMarkdownStreamRoot = defineComponent({
  name: 'XhMarkdownStreamRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    blocks: { type: Array as PropType<readonly MarkdownBlock[]>, default: () => [] },
    streaming: Boolean,
    announce: { type: String as PropType<'off' | 'polite'>, default: undefined },
    caret: { type: Boolean, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    translations: { type: Object as PropType<Partial<MarkdownStreamTranslations>>, default: undefined },
  },
  slots: Object as SlotsType<{
    default?: (props: MarkdownStreamRootSlotProps) => VNode[]
  }>,
  setup(props, { slots }) {
    const configured = withXhConfig('markdown-stream', props)
    // getter 透传保住响应性：块列表每帧换一份新数组，连接层要跟着重算
    const forward: MarkdownStreamProps = {
      get blocks() {
        return props.blocks
      },
      get streaming() {
        return props.streaming
      },
      get announce() {
        return props.announce
      },
      get caret() {
        return props.caret
      },
      get size() {
        return configured.size
      },
      get translations() {
        return configured.translations
      },
    }
    const ctx = useMarkdownStream(forward)
    provideMarkdownStream(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      blocks: ctx.api.value.blocks,
      streaming: ctx.api.value.streaming,
      announcement: ctx.api.value.announcement,
    }))
  },
})

export const XhMarkdownStreamContent = defineComponent({
  name: 'XhMarkdownStreamContent',
  slots: Object as SlotsType<{
    block?: (props: MarkdownStreamBlockSlotProps) => VNode[]
  }>,
  setup(_, { slots }) {
    const ctx = useMarkdownStreamContext()
    // 块是数据铺出来的，作者写不出 N 个节点，由组件铺；每块的内容可用 block 插槽接管
    return () => {
      const api = ctx.api.value
      return h('div', api.getContentProps() as Record<string, unknown>, api.blocks.map((block, index) => {
        const attrs = { ...api.getBlockProps({ block }) as Record<string, unknown>, key: block.key }
        const authored = slots.block?.({ block, index })
        if (authored)
          return h('div', attrs, authored)
        const html = markdownBlockHtml(block)
        // markdown 块直接铺已消毒的 html；代码与公式块没人接管就把原文当正文显示
        return html === undefined
          ? h('div', attrs, block.source ?? '')
          : h('div', { ...attrs, innerHTML: html })
      }))
    }
  },
})

export const XhMarkdownStreamLiveRegion = defineComponent({
  name: 'XhMarkdownStreamLiveRegion',
  setup(_, { slots }) {
    const ctx = useMarkdownStreamContext()
    return () => h(
      'div',
      ctx.api.value.getLiveRegionProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.announcement,
    )
  },
})
