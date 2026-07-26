import { createNormalizer } from '@xihan-ui/core'

// connect 产出的键已是 DOM 向（data-*/aria-*/type/tabindex/onXxx），
// 到真实 DOM 的翻译交给 spreadProps，这里恒等透传。
export const wcNormalize = createNormalizer(props => props)
