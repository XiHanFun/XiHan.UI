---
'@xihan-ui/headless': major
'@xihan-ui/react': major
'@xihan-ui/styles': major
'@xihan-ui/vue': major
'@xihan-ui/web-components': major
---

数字字段统一使用 `control` 作为必需的唯一输入壳，不再支持输入与加减按钮脱离 `control` 的三件并排结构。迁移时将 `input` 与可选的两颗动作按钮放进 `control`。

随旧结构删除的输入框盒与独立动作样式槽不再生效：`--xh-number-field-input-bg*`、`--xh-number-field-input-border*`、`--xh-number-field-input-h`、`--xh-number-field-input-radius`、`--xh-number-field-input-shadow`、`--xh-number-field-trigger-bg*`、`--xh-number-field-trigger-border*` 与 `--xh-number-field-trigger-radius`。

`subtle` 变体改用无投影的扁平填充面；加减动作与输入之间的分割线缩短为半高并垂直居中。
