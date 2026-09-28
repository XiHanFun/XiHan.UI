---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

TreeSelect 新增 `virtualizer`，与 Tree、Select 同一套 CollectionVirtualizer 接线：`count` 必须等于当前可见行数（不等即报错），键盘、连打检索与展开时的锚点按完整可见行的数据算，由桥把目标行滚进窗口再交接焦点；持焦点的行被窗口淘汰不再清掉锚点。三端自绘滚动条接管 Virtualizer 的视口，Web Components 经 `getRenderedItemRoots` 认领窗口里的节点。与 `searchable` 同开会明确报错：搜索视图的可见行由组件裁剪，外部 `count` 无从对齐。
