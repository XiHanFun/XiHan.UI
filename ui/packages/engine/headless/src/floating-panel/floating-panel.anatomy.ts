import { createAnatomy } from '@xihan-ui/kernel'

// root 是作者自己那棵树里的容器（触发器与面板都在它底下），positioner 摆位置与尺寸，
// content 承载 role=dialog 与键盘收口；header 一行里放标题、拖拽把手与三类按钮，body 是正文。
// 八个改尺把手共用 resize-trigger 一个名字，各自在节点上报自己守的是哪条边。
export const floatingPanelAnatomy = createAnatomy('floating-panel', [
  'root',
  'trigger',
  'positioner',
  'content',
  'header',
  'title',
  'drag-trigger',
  'resize-trigger',
  'window-state-trigger',
  'close-trigger',
  'body',
])
