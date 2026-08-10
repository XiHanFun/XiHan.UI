import { createAnatomy } from '@xihan-ui/kernel'

// 只有两个角色节点：root 收口键盘与 Tab 序列，item 是一个个可开关的按钮。
// 指示器与文本由作者写在 item 里，不另立 part。
export const toggleGroupAnatomy = createAnatomy('toggle-group', ['root', 'item'])
