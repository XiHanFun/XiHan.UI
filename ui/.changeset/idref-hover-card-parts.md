---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': patch
---

悬停卡片（HoverCard）判断标题与说明在不在场，改用与对话框等浮层同一套 `parts`：卡片的名字在标题不在场时仍指回 trigger，说明不在场、或渲染了但读不出一句话时不写描述链。

- headless：props 新增 `parts?: TitleDescriptionParts`（省略即按都在场，服务端直出与挂载前同此）；`HoverCardRefs` 去掉 `getTitleEl` 与 `getDescriptionEl`，连接层不再现查 DOM。
- vue / react：`XhHoverCardTitle` / `XhHoverCardDescription` 挂载时登记在场、卸载时撤销，说明读不出一句话按不在场处理。
- web-components：按作者写的部件交出 `parts`，说明部件的内容变化时重新接线。

迁移：Vue 的 `HoverCardContext` 删去 `titleRef`、`descriptionRef`，React 的 `HoverCardContext`（`useHoverCardContext`）删去 `setTitleEl`、`setDescriptionEl`。用库内 `XhHoverCardTitle` / `XhHoverCardDescription` 的不受影响；自写标题、说明部件的改为向 `parts` 报告在场。
