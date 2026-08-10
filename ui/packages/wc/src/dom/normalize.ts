import { createNormalizer } from '@xihan-ui/kernel'

// connect 产出的键已是 DOM 向，恒等透传，落到真实 DOM 由 spread 完成。
export const wcNormalize = createNormalizer(props => props)
