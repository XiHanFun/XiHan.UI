---
"@xihan-ui/designer-shell": minor
---

**新增** 导入字段对话框 `<xh-designer-field-import>` 与内置命令 `import-fields`。

- `<xh-designer-field-import>`：从一份 JSON 样例或一份 JSON Schema 导入字段树。内置「JSON 样例」「JSON Schema」两页，扩展的 `fieldSources` 排在后面；输入框下有读 `.json` 文件的投放区，解析失败时写出第几行第几列与原因。预览表一个字段一行、按层级缩进，可以勾掉、改显示名、类型，给了 `contents` 还能选内容种类；现有字段不为空时可选合并或替换，合并时标出种类不同的字段；内容带样例时可以同时作为示例数据。按「导入」派发 `fields-import { fields, mode, source, sample?, annotations }`，对话框不改设计器的字段。属性 `sources`、`fields`、`contents`、`inference`、`offerSample`、`open`、`source`，方法 `show(source?)`。
- `designerShellCommands()` 新增选项 `openFieldImport` 与 `fieldImportDisabled`：给了 `openFieldImport` 有命令 `import-fields`，不排位置，由各款放进面板头或菜单。
- 文案：新增 `xh-designer-field-import` 一桶，`xh-designer-commands` 一桶加 `importFields`，十种语言都有；新增导出 `DESIGNER_FIELD_IMPORT_EN_US`、`DESIGNER_FIELD_IMPORT_SOURCES`。
