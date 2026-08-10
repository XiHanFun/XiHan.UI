import { createAnatomy } from '@xihan-ui/kernel'

// root 是地标容器，group 是某一个位置上的那一摞（九个位各一个，作者按需渲染）。
// 单条通知不在这份解剖里，它属于 toast 组件自己的 scope。
export const toasterAnatomy = createAnatomy('toaster', ['root', 'group'])
