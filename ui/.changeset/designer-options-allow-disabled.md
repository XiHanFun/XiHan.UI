---
"@xihan-ui/designer-kit": minor
"@xihan-ui/designer-shell": minor
---

**新增** 内建编辑方式 `options` 加 `allowDisabled`：写 `false` 时选项没有禁用这回事（打印的值映射这类「值 → 文字」的对照表）。

- designer-kit：每项不能带 `disabled`，带了 `checkPropertyValue` / `findPropertyValueIssue` 报 `unknown-key`，问题落在那一项的 `disabled` 上。缺省照旧可以禁用。
- designer-shell：选项表只有值与文字两列，写出的选项不带 `disabled`；落在 `disabled` 上的问题标在那一项的值上。
