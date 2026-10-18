---
"@xihan-ui/designer-shell": patch
---

菜单命令里的复选条目（给了 `checked`、没写 `group`）点了以后会调命令的 `select`。复选条目选中后菜单不收起，只派发 `checkbox-value-change`，原来命令工具栏只接 `select`，内置的「面板」菜单勾不回已经收起的面板。
