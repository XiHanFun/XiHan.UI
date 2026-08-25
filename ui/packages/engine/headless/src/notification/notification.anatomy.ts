import { createAnatomy } from '@xihan-ui/kernel'

// root 是地标容器，group 是某一个位置上的那一摞（九个位各一个，作者按需渲染）。
// item 起是单条卡片：容器与卡片本就是一件事的两面，拆成两个组件只会逼使用者
// 去理解一个与他无关的中间概念。
export const notificationAnatomy = createAnatomy('notification', [
  'root',
  'group',
  'item',
  'item-title',
  'item-description',
  'item-action-trigger',
  'item-close-trigger',
])
