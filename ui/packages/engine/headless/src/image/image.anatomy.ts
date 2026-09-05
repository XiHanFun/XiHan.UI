import { createAnatomy } from '@xihan-ui/core'

// placeholder 只在图片未落位时露面，fallback 承担失败与延迟窗口过后的兜底内容。
export const imageAnatomy = createAnatomy('image', ['root', 'image', 'placeholder', 'fallback'])
