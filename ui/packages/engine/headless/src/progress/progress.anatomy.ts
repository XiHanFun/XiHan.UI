import { createAnatomy } from '@xihan-ui/kernel'

// canvas 是承载环的 <svg>，label 是环心那一块；两个都只在环形下渲染，作者不写也成立。
export const progressAnatomy = createAnatomy('progress', ['root', 'canvas', 'track', 'range', 'label'])
