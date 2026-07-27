import { createAnatomy } from '@xihan-ui/core'

// 只有两个角色节点：root 收口键盘与 Tab 序列，item 是一个个可开关的按钮。
// 指示器、文本一律由作者自己写在 item 里，不另立 part——它们没有任何状态要承载。
export const toggleGroupAnatomy = createAnatomy('toggle-group', ['root', 'item'])
