import { createAnatomy } from '@xihan-ui/core'

export const clipboardAnatomy = createAnatomy('clipboard', [
  'root',
  'label',
  'control',
  'input',
  'copy-trigger',
  'indicator',
  // 复制成功的播报区，视觉隐藏；不渲染它时读屏用户拿不到任何成功回执
  'status',
])
