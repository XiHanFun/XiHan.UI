import { createAnatomy } from '@xihan-ui/kernel'

// root 是标签本体，label 收住标签文字，close-trigger 是那颗移除钮。
// 图元由作者写进 root，不另立 part。
export const tagAnatomy = createAnatomy('tag', ['root', 'label', 'close-trigger'])
