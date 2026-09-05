import { createAnatomy } from '@xihan-ui/core'

// root 是定位壳，只管把按钮钉在视口一角；trigger 是真正可点、可聚焦的那个按钮。
export const backTopAnatomy = createAnatomy('back-top', ['root', 'trigger'])
