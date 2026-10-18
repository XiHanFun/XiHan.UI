---
'@xihan-ui/designer-kit': minor
'@xihan-ui/designer-shell': minor
---

命令的新落点与状态栏：

- designer-kit：命令位置新增 `header`（顶栏中段的插入快捷钮）；命令新增 `shortLabel`，顶栏按钮图标下的短文字，不给用 `label`。
- designer-shell：命令工具栏新增显示方式 `stacked`（图标在上、短文字在下，钮高随内容），新增 `commandShortLabel`。
- designer-shell：新增内置命令 `designerShellCommands({ translations, openSettings?, helpUrl?, icons? })`，给出打开设置对话框的 `settings` 与打开帮助页的 `help`；`xh-designer-commands` 文案新增 `panels`、`settings`、`help`，十种语言。
- designer-shell：新增 `createStatusItem(document, { label?, value, tone?, action? })`，状态栏上的一项，标签弱一档、值按语气着色，给了 `action` 是一颗 ghost 小按钮。
