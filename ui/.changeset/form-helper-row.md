---
'@xihan-ui/styles': major
---

字段辅助行与表单项距改写：

- Field / Fieldset 的说明改为 12px（`--xh-text-caption-size`）+ `--xh-fg-subtle`，禁用改 `--xh-fg-disabled`；错误文案改为 12px，颜色不变
- 说明与错误文案紧贴控件（`--xh-field-gap` 缺省改为 0），这一行辅助行最小高 20px；为错误文案预留的那一行随之是 20px
- Form 项距改为 20px（`--xh-space-5`），且辅助行算在项距里：带说明或预留了错误文案行的字段，那一行就是项距，不再另留；项距改由每一项的下外边距给，表单根的行间 gap 归零，最后一项不留
- `inline` 一行流列距改为 24px（`--xh-form-inline-gap`），新增 `--xh-form-inline-row-gap`（缺省 8px）管行距；网格档列距随 `--xh-form-gap` 改为 20px
- 字段集组内项距改为 20px
- 出错的字段不再在起始缘画色带：删除覆盖槽 `--xh-form-field-invalid-px` 与 `--xh-form-field-invalid-border`
