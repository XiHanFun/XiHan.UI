import { createAnatomy } from '@xihan-ui/kernel'

// root 是外壳；header 放文件名与增删统计，stat 是统计位（增删各一个）；
// viewport 是滚动容器与唯一的 Tab 停靠点；
// body 是 role=table；一行叫 row 不叫 line，因为它带 role=row 与 aria-rowindex——
// 不带表格语义的纯文本行才叫 line（code-view / log）。row 是一行，line-number 是行号槽（不给 role，皮肤用 attr() 画），
// line-content 是唯一暴露的内容列，change-label 住在它里面并视觉隐藏——
// 变更类型不能只靠颜色传达；segment 是词级片段，裹住 token；token 是着色片段；
// gap 是折起来的上下文那一行，gap-cell 裹住它、gap-trigger 展开它；empty 是无变更时的占位；
// truncation 是「这份差异被砍掉过多少行」的提示条，只在真砍过时露出来。
export const diffViewAnatomy = createAnatomy('diff-view', [
  'root',
  'header',
  'stat',
  'viewport',
  'body',
  'row',
  'line-number',
  'line-content',
  'change-label',
  'segment',
  'token',
  'gap',
  'gap-cell',
  'gap-trigger',
  'empty',
  'truncation',
])
