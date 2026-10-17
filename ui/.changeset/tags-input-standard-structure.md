---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

标签输入框改用标准结构：新增 `tagsInputStructure` 与 `TagsInputStructureOptions`。三端新增 `label`（标题文字；Vue 另有 `label` 插槽，React 可传任意节点）与标签文本的接管方式（Vue 的 `item` 插槽、React 的 `renderItem`、Web Components 的 `slot="item:<值>"`）。Vue 不写默认插槽、React 不给 children 时照结构铺出标题、盒里按当前值铺的标签（开了 `editable` 带编辑框）与输入框、清空按钮、计数（开了 `showCount`）与表单影子，原先这种写法什么都不渲；Web Components 的 `<xh-tags-input>` 不写部件或只写 `root` 时按它生成，标签随值增删。
