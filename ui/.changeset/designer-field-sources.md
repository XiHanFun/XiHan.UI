---
"@xihan-ui/designer-kit": minor
---

**新增** 扩展点 `fieldSources`：导入字段对话框里内置的「JSON 样例」「JSON Schema」两页之后，扩展可以再加页（如从接口请求取一份样例）。一项是 `{ id, label, icon?, order?, create(host) }`，页拿到内容后经 `host.provide()` 交回一份样例、一份 JSON Schema 或已经算好的字段，推断、预览与确认走对话框自己的；切走这一页或对话框关上时 `host.signal` 中止。字段来源 id 参与扩展查重，重名时抛 `DesignerExtensionError`（名字空间 `field-source`）。新增类型 `DesignerFieldSource`、`DesignerFieldSourceContent`、`DesignerFieldSourceHost`、`DesignerFieldSourcePage`。
