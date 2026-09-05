import { createAnatomy } from '@xihan-ui/core'

// root 是那层容器；separator 是段间的装饰线，可以不渲染。
// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const buttonGroupAnatomy = createAnatomy('button-group', ['root', 'separator'])
