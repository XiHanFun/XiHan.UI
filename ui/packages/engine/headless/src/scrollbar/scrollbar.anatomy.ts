import { createAnatomy } from '@xihan-ui/kernel'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
//
// root 是定位盒与指针热区，track 是量长度的那条轨，thumb 的位置与长度由连接层写进内联样式。
// 三层而不是两层：hover 时加粗这类做法要改 root 的厚度，而滑块的行程按 track 算——
// 两者压在同一个节点上，一加粗滑块就会跳。
//
// corner 是横竖两条同时摆着时交叉口那块补丁，可选：写在其中一条的 root 里，
// 贴在它末端之外的那一格上，跟着这一条的显隐走；配合 gutter 让两条各自让出交叉口。
export const scrollbarAnatomy = createAnatomy('scrollbar', [
  'root',
  'track',
  'thumb',
  'corner',
])
