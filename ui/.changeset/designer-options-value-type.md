---
"@xihan-ui/core": minor
"@xihan-ui/designer-kit": minor
"@xihan-ui/designer-shell": minor
---

**新增** 内建编辑方式 `options` 加 `valueType`：`value` 的类型，取 `"string"`（缺省）、`"number"`、`"boolean"`、`"date"`、`"datetime"`，供报表参数候选项这类取值不是文字的选项列表用。

- core：`@xihan-ui/core/options` 的 `findOptionViolation` 新增选项 `isValue`，换掉缺省只收字符串的 `value` 检查，不合要求报 `invalid-value`；重复按 `Object.is` 判。
- designer-kit：`number` 收有限数字，`boolean` 收 `true` / `false`，`date` 收 ISO 日期（如 `2026-10-19`），`datetime` 收带时刻的 ISO 日期时间（如 `2026-10-19T08:30`），都按 `@xihan-ui/core/date` 的 `PlainDate` / `PlainDateTime` 严格解析。类型不对报 `invalid-type`，日期写法不对报 `invalid-value`，缺了 `value` 报 `required`，重复报 `duplicate-value`（数字按数值判），问题都落在那一项的 `value` 上。新增类型 `PropertyOptionValueType`。
- designer-shell：值格按类型换控件：`number` 是数字框，写回数值，清空即去掉 `value`；`date` / `datetime` 是日期框（到日 / 到分）；`boolean` 固定 `true`、`false` 两行，值格只读、显示「是 / 否」，不能增删换序，改文字或禁用时两项都写、`true` 在前。文案新增 `optionBoolean`，十种语言都有。
