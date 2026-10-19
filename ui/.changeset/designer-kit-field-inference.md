---
'@xihan-ui/designer-kit': minor
---

新增子入口 `@xihan-ui/designer-kit/field-inference`：`inferDataFields(sample, options?)` 从一份 JSON 样例推断字段树（类型、ISO 日期与日期时间、可选的图片地址识别，对象数组合并各项的键），`dataFieldsFromJsonSchema(schema, options?)` 从一份 JSON Schema 推断字段树（`format`、本文档内的 `$ref`、`allOf`、`oneOf` / `anyOf`、`title` 作显示名），`mergeDataFields(current, incoming)` 把导入的字段并进现有字段。结果带按码给出的推断说明（`notes`），以及必填、候选值、缺省值、说明文字这类 `DataField` 放不下的注解（`annotations`）。
