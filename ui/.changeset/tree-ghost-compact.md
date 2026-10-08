---
'@xihan-ui/headless': major
'@xihan-ui/styles': major
---

Tree 缺省形态由 outline 改为 ghost（直接落在页面或宿主面上），要外框时显式写 `variant="outline"`。行内内衬收为一条窄边（sm / md / lg 2 / 4 / 6px），缩进改为「箭头盒 + 箭头到文字的间距」（md 24px，子节点箭头对齐父节点文字起点），行与行之间不再留缝；展开箭头在 16px 盒里只画 12px、改取次级前景；连接线改为 border-default；分支在取子节点时转圈改为品牌色（新增覆盖槽 `--xh-tree-branch-loading-fg`）。
