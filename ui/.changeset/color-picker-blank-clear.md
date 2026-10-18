---
'@xihan-ui/headless': major
'@xihan-ui/styles': minor
'@xihan-ui/web-components': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
---

取色器单选的空值改为未选，并新增清空钮。原先单选给空数组按缺省色 `#000000` 显示，值是 `['#000000']`，表单里的颜色字段明明没填却显示黑色，选过颜色后也清不回空值。现在单选给空数组是未选：色块画一道斜线、值文字显示 `placeholder`（新增，缺省取新增的 `translations.placeholder`），触发钮念出占位提示，`value` 为空数组、表单影子为空串，`required` 会拦下。依赖空数组得到黑色的，改写 `['#000000']`；`value` 与 `defaultValue` 都不给时照旧从 `#000000` 起。

单选有值时盒里露出清空钮 `clear-trigger`（新部件，可及名取新增的 `translations.clearTrigger`，不占 Tab 位），按下清回未选，先发值变化再发新增的 `clear` 事件（React `onClear`）；`setValue([])` 同样清回未选、不发 `clear`。api 新增 `empty`、`valueText` 与 `getClearTriggerProps`；皮肤新增覆盖槽 `--xh-color-picker-placeholder-fg`、`--xh-color-picker-swatch-empty-stroke` 与清空钮的 `--xh-color-picker-action-*`。十种内建语言包补上两条文案。 取色器皮肤去注释后从 20713 字节涨到 23459 字节（约 13%），多出来的是清空钮的 field-inset 接线与兜底字形、它在高对比档里的字形、未选时值文字与色块的两条规则。
