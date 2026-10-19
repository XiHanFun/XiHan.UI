---
'@xihan-ui/designer-shell': minor
---

面板头的标题至少留四个字宽，窄了先让操作区：面板头命令条（`createPanelActions`）放不下的钮收进面板头已有的「更多」菜单，排在布局条目的前面。命令工具栏 `createCommandToolbar` 新增选项 `overflow: 'external'`（放不下的钮由调用方列在别处，收起的条目变了时派发 `overflow-change`），以及 `overflowed()` 与 `activate(id)`。
