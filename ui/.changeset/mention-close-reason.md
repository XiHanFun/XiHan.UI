---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 提及收起时 `onOpenChange`（事件 `open-change`）带上关闭原因 `reason`：Escape 报 `esc`；点在候选外、焦点离开输入框报 `interact-outside`；Tab 报 `tab`；没有可提交的候选时按 Enter 报 `close-trigger`；选中候选报 `selection`。候选随正文与光标自动收起（打了空格、删掉触发符、光标挪出、改写正文）不是一次关闭手势，与 `close()` 一样报 `programmatic`。展开时不带。
