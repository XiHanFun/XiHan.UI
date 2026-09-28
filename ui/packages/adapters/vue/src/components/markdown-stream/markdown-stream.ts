/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 markdown stream 相关实现。

import type { Size } from '@xihan-ui/core'
import type { MarkdownBlock, MarkdownInlineMount, MarkdownStreamApi, MarkdownStreamProps, MarkdownStreamTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import { markdownBlockHtml, queryMarkdownInlines, sameMarkdownInlines } from '@xihan-ui/headless'
import { defineComponent, h, onMounted, onUpdated, ref, shallowRef, Teleport } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideMarkdownStream, useMarkdownStreamContext } from './context'
import { useMarkdownStream } from './use-markdown-stream'

/** 默认插槽的载荷：块列表与流式状态，以及完成后要播报的文案。 */
export type MarkdownStreamRootSlotProps = Pick<MarkdownStreamApi, 'blocks' | 'streaming' | 'announcement'>

/** 逐块插槽的载荷。作者据此接管代码块与公式块。 */
export interface MarkdownStreamBlockSlotProps {
  block: MarkdownBlock
  /** 0 基块下标。 */
  index: number
}

/** 行内引用插槽的载荷：正文里 [@来源] 写成的一处引用，渲进 html 里的占位节点。 */
export interface MarkdownStreamCitationSlotProps {
  /** 这一处引用的来源 id，按书写顺序排；一处多源时不止一个。 */
  sourceIds: readonly string[]
  block: MarkdownBlock
  /** 该挂点在块内的 0 基下标。 */
  index: number
}

/** 行内公式插槽的载荷：交给宿主的公式引擎渲染。 */
export interface MarkdownStreamMathSlotProps {
  /** 未经转义的 TeX 原文。 */
  source: string
  /** 行内写的 `$$…$$` 为真。 */
  display: boolean
  block: MarkdownBlock
  /** 该挂点在块内的 0 基下标。 */
  index: number
}

export const XhMarkdownStreamRoot = defineComponent({
  name: 'XhMarkdownStreamRoot',
  // 有 connect 兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    blocks: { type: Array as PropType<readonly MarkdownBlock[]>, default: () => [] },
    streaming: Boolean,
    announce: { type: String as PropType<'off' | 'polite' | 'assertive'> },
    caret: { type: Boolean, default: undefined },
    size: { type: String as PropType<Size> },
    translations: { type: Object as PropType<Partial<MarkdownStreamTranslations>> },
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
    citation?: (props: MarkdownStreamCitationSlotProps) => VNode[]
    math?: (props: MarkdownStreamMathSlotProps) => VNode[]
  }>,
  setup(_, { slots }) {
    const ctx = useMarkdownStreamContext()
    const host = ref<HTMLElement | null>(null)
    // 占位节点是 html 铺进去之后才有的：每次提交后重新找一遍，指向的节点变了才重渲
    const mounts = shallowRef<readonly MarkdownInlineMount[]>([])
    const cleared = new WeakSet<HTMLElement>()
    const collect = (): void => {
      const el = host.value
      if (!el || (!slots.citation && !slots.math)) {
        if (mounts.value.length > 0)
          mounts.value = []
        return
      }
      const next = queryMarkdownInlines(el, ctx.api.value.blocks)
        .filter(mount => (mount.inline.kind === 'citation' ? slots.citation : slots.math) !== undefined)
      // 由作者接管的占位节点先清掉降级内容，传送进来的节点是它唯一的内容
      for (const mount of next) {
        if (!cleared.has(mount.element)) {
          mount.element.textContent = ''
          cleared.add(mount.element)
        }
      }
      if (!sameMarkdownInlines(next, mounts.value))
        mounts.value = next
    }
    onMounted(collect)
    onUpdated(collect)

    // 块是数据铺出来的，作者写不出 N 个节点，由组件铺；每块的内容可用 block 插槽接管
    return () => {
      const api = ctx.api.value
      const blocks = api.blocks.map((block, index) => {
        const attrs = { ...api.getBlockProps({ block }) as Record<string, unknown>, key: block.key }
        const authored = slots.block?.({ block, index })
        if (authored)
          return h('div', attrs, authored)
        const html = markdownBlockHtml(block)
        // markdown 块直接铺已消毒的 html；代码与公式块没人接管就把原文当正文显示
        return html === undefined
          ? h('div', attrs, block.source ?? '')
          : h('div', { ...attrs, innerHTML: html })
      })
      // 行内挂点：作者的引用角标、公式节点传送进 html 里的占位节点
      const inlines = mounts.value.map((mount) => {
        const { inline, block, index } = mount
        const content = inline.kind === 'citation'
          ? slots.citation?.({ sourceIds: inline.sourceIds, block, index })
          : slots.math?.({ source: inline.source, display: inline.display, block, index })
        return h(Teleport, { key: mount.key, to: mount.element }, content ?? [])
      })
      return h('div', { ...api.getContentProps() as Record<string, unknown>, ref: host }, [...blocks, ...inlines])
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
