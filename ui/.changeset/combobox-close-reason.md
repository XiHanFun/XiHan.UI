---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 组合框收起时 `onOpenChange`（事件 `open-change`）带上关闭原因 `reason`：Escape 报 `esc`；点在列表外、焦点离开组件报 `interact-outside`；Tab 报 `tab`；再点触发钮、Alt+↑、没有可确认的候选时按 Enter 报 `close-trigger`；单选选中候选、`allowCustomValue` 下回车收下输入串报 `selection`；`setOpen(false)` 报 `programmatic`。展开时不带。
