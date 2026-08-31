import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { MarkdownStreamApi, MarkdownStreamProps } from './markdown-stream.types'
import { dataAttr } from '@xihan-ui/kernel'
import { markdownStreamAnatomy } from './markdown-stream.anatomy'
import { isLiveMarkdownBlock } from './markdown-stream.types'

const parts = markdownStreamAnatomy.build()

// 无状态机：把已渲好的块列表投影成各 part 的属性。块本身不在这里渲染，也不在这里生成。
export function connectMarkdownStream<T extends PropTypes>(
  props: MarkdownStreamProps,
  normalize: NormalizeProps<T>,
): MarkdownStreamApi<T> {
  const streaming = !!props.streaming
  const caret = props.caret !== false
  const announce = props.announce ?? 'off'
  // 还在增长时不播报：每来一个 token 念一次会把读屏刷爆
  const announcement = announce === 'polite' && !streaming
    ? props.translations?.completed ?? 'Response complete'
    : undefined

  return {
    blocks: props.blocks,
    streaming,
    announcement,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 相位走 phase 族的既有取值，不另造一个同义词
      'data-state': streaming ? 'streaming' : 'complete',
      'data-size': props.size,
      // 一块都还没来的那一段，光标落在外壳上：请求发出去了这件事第一帧就看得见
      'data-caret': dataAttr(caret && streaming && props.blocks.length === 0),
    }),

    // 正文就是正文，套 role 只会给读屏加噪
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
    }),

    getBlockProps: ({ block }) => normalize.element({
      ...parts.block.attrs,
      'data-kind': block.kind,
      'data-live': dataAttr(isLiveMarkdownBlock(block)),
      // 流式光标画在这一格末尾
      'data-caret': dataAttr(caret && isLiveMarkdownBlock(block)),
      'data-complete': dataAttr(block.complete),
      'data-lang': block.lang,
    }),

    getLiveRegionProps: () => normalize.element({
      ...parts['live-region'].attrs,
      'role': 'status',
      'aria-live': 'polite',
      'aria-atomic': 'true',
    }),
  }
}
