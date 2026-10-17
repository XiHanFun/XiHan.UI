---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

切换按钮组改用标准结构：新增 `toggleGroupStructure` 与 `ToggleGroupStructureOptions`。Vue 不写默认插槽、React 不给 children 时照它铺出缺省树，每一条一个按钮，末尾一份表单影子（给了 `name` 才参与提交），不再要求先给 `collection`；Web Components 的 `<xh-toggle-group>` 不写部件或只写 `root` 时按它生成，某一条的内容可以用 `slot="item:<值>"` 接管。
