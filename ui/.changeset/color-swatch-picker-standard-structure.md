---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

颜色色块选择器改用标准结构：新增 `colorSwatchPickerStructure` 与 `ColorSwatchPickerStructureOptions`，次序是标题、`swatches` 的每一格，格里依次是表单影子、色块面与选中标记。Vue / React 不写默认插槽时照它铺，格里的三格仍由格子自己装配；Web Components 的 `<xh-color-swatch-picker>` 新增 `label` 属性，不写部件或只写 `root` 时生成整套节点，标题可用 `slot="label"` 接管。
