---
'@xihan-ui/designer-shell': minor
---

**新增** JSON 编辑零件 `<xh-designer-json-editor>`：在对话框里编辑整份模板的 JSON。等宽字体的编辑框下面是解析失败的说明与问题列表，底边是格式化、复制、取消与应用；文字一变就重新解析并交给设计器的 `validate`，解析失败或有错误级问题时「应用」不可用。点一条问题，光标选中那个路径在文字里的值；解析失败时「转到出错处」把光标放到出错处。按「应用」派发 `json-apply { value }`，由设计器换上新文档；`readonly` 时只能看、格式化与复制。

- 内置命令 `edit-json`（`Mod+Shift+J`）：`designerShellCommands` 给了 `openJsonEditor` 才有，不上工具栏。
- 问题列表 `<xh-designer-issues>` 新增 `activate` 属性：`path` 时凡有路径的条目都能点，缺省 `target` 照旧只有落在对象上的问题能点。
- 文案新增 `xh-designer-json-editor` 一桶（`DESIGNER_JSON_EDITOR_EN_US`）与共用命令的 `editJson`，十种语言。
