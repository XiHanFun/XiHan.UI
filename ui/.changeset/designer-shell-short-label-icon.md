---
'@xihan-ui/designer-kit': minor
'@xihan-ui/designer-shell': minor
---

**变更** 命令工具栏只显示图标时，没有图标的按钮写短文字（`shortLabel`，没给就是 `label`），不再写全名；名字与提示仍取 `label`。

**新增** 约定短文字要出现在 `label` 里（不分大小写）：按钮上看得见的字要包含在按钮的名字里。开发期命令工具栏发现某条命令的短文字不在 `label` 里时，经诊断通道报一条 `core.warn` 告警（scope 为 `designer-commands`），一条命令只报一次。
