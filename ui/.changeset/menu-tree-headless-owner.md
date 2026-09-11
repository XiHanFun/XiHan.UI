---
'@xihan-ui/headless': minor
'@xihan-ui/react': major
'@xihan-ui/vue': major
'@xihan-ui/web-components': patch
---

将 Menu、ContextMenu 与 Menubar 的多级子菜单所有权下沉到 headless：直属子节点登记、
递归 Portal 悬停区域、叶到根关闭顺序与唯一根选择通知现在由 `createMenuTreeNode` 统一维护，
三端适配器只连接宿主上下文、DOM getter、Portal 和生命周期。

React 与 Vue 删除仅供旧适配器内部收链使用、但曾被误导出的 `MenuChain`、
`ContextMenuChain`、`MenubarChain` 及对应 Provider / provide / use API。组合部件无需作者接入这些接口。
