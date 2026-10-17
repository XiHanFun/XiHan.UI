---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

文本框改用标准结构：新增 `textFieldStructure` 与 `TextFieldStructureOptions`。三端新增 `label`（标题文字；Vue 另有 `label` 插槽，React 可传任意节点）。Vue 不写默认插槽、React 不给 children 时照结构铺出标题、盒里的单行输入框与清空按钮（开了 `clearable`）、字数（开了 `showCount`），原先这种写法什么都不渲；Web Components 的 `<xh-text-field>` 不写部件或只写 `root` 时按它生成，标题可以用 `slot="label"` 接管。前后缀与多行宿主照旧手写部件。
