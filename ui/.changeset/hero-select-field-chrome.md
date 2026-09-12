---
'@xihan-ui/styles': major
'@xihan-ui/web-components': patch
---

Select 默认控件改为无边框实体面、轻阴影与 12px 圆角；`outline`、`subtle` 与 `ghost` 保留独立形态。选项按压改用可过渡的背景色，并将选中标记覆盖槽更名为 `--xh-select-item-check-fg`。

同步校准复用 Select 字段与弹层结构的 TreeSelect 计算样式基线。

Web Components 在首次键盘展开后，待 `inert` 移除且 Portal 同步完成再补焦点到高亮项。
