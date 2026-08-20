import { createAnatomy } from '@xihan-ui/kernel'

// root 是排布容器，split 是夹在两个子项之间的分隔符。
// 子项本身不是角色节点：它们是作者的内容，组件只管把它们排开、在中间留白。
export const spaceAnatomy = createAnatomy('space', ['root', 'split'])
