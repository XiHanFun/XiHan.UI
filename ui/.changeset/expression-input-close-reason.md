---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 表达式输入的补全列表收起时 `onOpenChange`（事件 `open-change`）带上关闭原因 `reason`：Escape 报 `esc`；点在补全列表外、焦点离开输入框报 `interact-outside`；Tab 与 Shift+Tab 报 `tab`；没有高亮的补全时按 Enter 报 `close-trigger`；Enter 或 Tab 接受补全报 `selection`。补全随正文与光标自动收起（光标挪出名字、没有匹配、开始输入法组合、改写正文）不是一次关闭手势，与 `close()` 一样报 `programmatic`。展开时不带。
