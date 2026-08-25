import { createAnatomy } from '@xihan-ui/kernel'

// root 是作用域包装（它不占布局），group 是某一个位置上的那一摞、也是地标
// （九个位各一个，作者按需渲染）。
// item 起是单条卡片：容器与卡片本就是一件事的两面，拆成两个组件只会逼使用者
// 去理解一个与他无关的中间概念。
export const notificationAnatomy = createAnatomy('notification', [
  'root',
  'group',
  'item',
  // 类型指示符：作者不往里写东西时由皮肤按 data-type 画一枚兜底字形，
  // 因此「这条是成功还是出错」不依赖作者自己准备图标
  'item-indicator',
  'item-title',
  'item-description',
  'item-action-trigger',
  'item-close-trigger',
])
