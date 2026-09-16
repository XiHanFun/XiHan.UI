---
"@xihan-ui/styles": patch
"@xihan-ui/headless": patch
---

**必填星号与错误文案抽到公共层。** `label.css` 新收两段：必填星号（`--xh-glyph-mark-required` + `--xh-space-1` + `--xh-fg-danger`）与无效档标签色（`--xh-fg-danger`），按 `field` 的 `label`、`fieldset` 的 `legend` 自己身上的 `data-required` / `data-invalid` 选中；`description.css` 扩为说明与错误文案的公共层，收进两者逐值相同的外边距、行距、默认字号与字色（说明 `--xh-fg-muted`、错误 `--xh-fg-danger`，都是 `--xh-text-secondary-size`）。`field.css` 与 `fieldset.css` 删掉自己那份同样的声明，只留接覆盖槽的 `color` / `font-size`——`--xh-field-label-star`、`--xh-field-label-fg-invalid`、`--xh-field-description-*`、`--xh-field-error-*` 与 `--xh-fieldset-*` 各槽名字与默认值都没动。像素不变。

自带标签的字段接入这一层 = connect 在标签部件投影 `data-required`，再把 scope 加进 `label.css` 的列表；控件本体不画星号。按需引入的人两份公共层都要引在组件皮肤之前：`import '@xihan-ui/styles/label.css'`、`import '@xihan-ui/styles/description.css'`。

`label.css` 从 1162 字节涨到 1548、`description.css` 从 255 涨到 692，涨的就是这四段；`field.css`、`fieldset.css` 各缩 262 / 268 字节。

**Headless：`field` 的 `getLabelProps` 与 `fieldset` 的 `getLegendProps` 新增投影 `data-required` 与 `data-invalid`。** 公共层按标签自己的状态位画，不再回头看根；根上的同名两位保留，供横排布局等规则用。属性名都已在公开面里，没有新名字。
