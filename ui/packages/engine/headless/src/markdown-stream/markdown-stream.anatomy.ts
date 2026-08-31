import { createAnatomy } from '@xihan-ui/kernel'

// root 是外壳并承载流式标记，content 是正文包裹层，block 是一个顶层块，
// live-region 是视觉隐藏的原子播报区。
export const markdownStreamAnatomy = createAnatomy('markdown-stream', ['root', 'content', 'block', 'live-region'])
