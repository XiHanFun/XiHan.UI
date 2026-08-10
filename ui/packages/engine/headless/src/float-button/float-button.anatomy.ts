import { createAnatomy } from '@xihan-ui/kernel'

// root 是定位壳，只管把整组钉在视口一角；trigger 是唯一可点、可聚焦的那颗；
// list 装展开的那一组动作。data-part 直接用 kebab-case，与 CSS 选择器一致。
export const floatButtonAnatomy = createAnatomy('float-button', ['root', 'trigger', 'list'])
