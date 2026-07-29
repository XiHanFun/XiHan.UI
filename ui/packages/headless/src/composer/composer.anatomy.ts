import { createAnatomy } from '@xihan-ui/core'

// 没有独立的 stop-trigger，流式期间 submit-trigger 原位换 aria-label 与 data-mode。
export const composerAnatomy = createAnatomy('composer', ['root', 'input', 'submit-trigger'])
