import { createAnatomy } from '@xihan-ui/kernel'

// root 是外壳；header 放文件名与增删统计；viewport 是滚动容器与唯一的 Tab 停靠点；
// body 是 role=table；row 是一行，line-number 是行号槽（不给 role，皮肤用 attr() 画），
// line-content 是唯一暴露的内容列，change-label 住在它里面并视觉隐藏——
// 变更类型不能只靠颜色传达；token 是着色片段；
// gap 是折起来的上下文那一行，gap-cell 裹住它、gap-trigger 展开它；empty 是无变更时的占位。
export const diffViewAnatomy = createAnatomy('diff-view', [
  'root',
  'header',
  'viewport',
  'body',
  'row',
  'line-number',
  'line-content',
  'change-label',
  'token',
  'gap',
  'gap-cell',
  'gap-trigger',
  'empty',
])
