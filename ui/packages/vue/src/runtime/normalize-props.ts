import { createNormalizer } from '@xihan-ui/core'

// Vue 直接接受 IR 的 class / onClick / data-* / aria-* / tabindex，透传即可。
// 后续如需 onChange→onInput 等事件名映射，在此集中处理。
export const vueNormalize = createNormalizer(props => props)
