---
'@xihan-ui/styles': major
---

字段标签角色改写（Field 与 TextField、Select、NumberField、Slider、Rating、FileUpload 等 26 个自带标签的字段）：

- 标签色由 `--xh-fg-default` 改为 `--xh-fg-muted`；禁用不再另变色（再淡一档与静息分不出，`--xh-fg-disabled` 对比不足），禁用由控件自己的禁用面表出
- 竖排时标签与控件的距离由 4px 改为 8px（`--xh-space-2`），新增各组件的 `--xh-<组件>-label-gap` 覆盖槽单独管这一段；FileUpload 的标签距离一并回到 8px
- 必填星号挪到标签文字之前（`::before`），取说明字号 12px；`--xh-field-label-star` / `--xh-fieldset-legend-star` 照旧管颜色
- Form 横排（标签左置）时标签列缺省宽由 30% 改为一行的 5 / 24，标签与控件的列距由 12px 改为 16px
- TreeSelect 新增 `--xh-tree-select-label-fg-disabled` 覆盖槽，与同族一致
