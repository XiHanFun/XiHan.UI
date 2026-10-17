---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

取色器改用标准结构：新增 `colorPickerStructure` 与 `ColorPickerStructureOptions`。浮层形态的次序是标题、盒（多选时先是标签行，再是带色块与值串的触发钮）、表单影子（给了 `name` 才有）、浮层；`inline` 时取色面直接铺在 root 里。取色面里依次是取色区、色相滑块、透明度滑块（开了 `alpha` 才有）、十六进制输入框、预设色板（给了 `swatches` 才有）、最近使用色，多选时末尾是「添加」；屏幕取色按钮不在其中。Vue / React 不写默认插槽时照它铺；Web Components 的 `<xh-color-picker>` 不写部件或只写 `root` 时生成整套节点，标题可用 `slot="label"` 接管。三端新增 `label`：Vue 是标题文字与 `label` 插槽，React 可传任意节点，Web Components 是 `label` 属性，只在不写结构时使用。`ColorPickerTranslations` 新增 `confirmTrigger`（「添加」按钮的文字，十种语言都已补上），`ColorPickerApi` 新增 `translations`。
