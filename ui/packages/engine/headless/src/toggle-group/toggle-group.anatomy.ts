import { createAnatomy } from '@xihan-ui/core'

// root 收口键盘与 Tab 序列，item 是一个个可开关的按钮。
// separator 是段间的装饰竖线，hidden-input 是表单出口，两者都可以不渲染。
// 指示器与文本由作者写在 item 里，不另立 part。
export const toggleGroupAnatomy = createAnatomy('toggle-group', ['root', 'item', 'separator', 'hidden-input'])
