---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Tree 新增节点级加载态与缩进参考线：

- `loadingValue`：正在取子节点的分支，报告 `aria-busy` 并投影 `data-loading`，展开箭头换成转圈、不再按开合转向；减弱动效与打印下转圈停住，静止字形仍在。取数归作者，文档示例「异步加载子节点」改为这种写法，不再放占位行。
- `lines`：缩进参考线，`tree` 部件投影 `data-lines`，皮肤在每一层子层的行首画一道竖线，落在父节点展开箭头的中线上、贯穿这一层的全部子孙；颜色取内部分隔线，公开槽 `--xh-tree-line-color`，强制色下取 `GrayText`。只是外观，不改结构与键盘。

皮肤涨在参考线（含强制色）与转圈（含减弱动效与打印的停转）两组规则上。
