import { createAnatomy } from '@xihan-ui/core'

// peg 是跟在进度段末端的一道亮边，作者可以往里塞自己的图形；不渲染它时条子照旧成立。
export const loadingBarAnatomy = createAnatomy('loading-bar', ['root', 'track', 'range', 'peg'])
