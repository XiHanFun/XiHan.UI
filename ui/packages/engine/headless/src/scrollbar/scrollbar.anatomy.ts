import { createAnatomy } from '@xihan-ui/kernel'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
//
// root 是定位盒与指针热区，track 是量长度的那条轨，thumb 的位置与长度由连接层写进内联样式。
// 三层而不是两层：hover 时加粗这类做法要改 root 的厚度，而滑块的行程按 track 算——
// 两者压在同一个节点上，一加粗滑块就会跳。
//
// 没有 corner：两条滚动条交叉口那块补丁属于同时摆了两条的那个容器（scroll-area 有它），
// 单轴滚动条自己没有可补的缺口。
export const scrollbarAnatomy = createAnatomy('scrollbar', [
  'root',
  'track',
  'thumb',
])
